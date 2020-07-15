import Session from "./model";
import Class from "../class/model";
import User from "../user/model";
import { addMinutes, isBefore } from "date-fns";

import {
  assertGroupAuthorization,
  assertSessionInstantiation,
} from "../../helpers/permissions";

export default {
  Query: {
    async getSession(_, { id }, { user }) {
      const session = await Session.findById(id);
      assertGroupAuthorization(user, session.users);
      return session;
    },
  },
  Session: {
    async class(session) {
      await session.populate("class").execPopulate();
      return session.class;
    },
    async tutors(session) {
      await session.populate("tutors").execPopulate();
      return session.tutors;
    },
    async tutees(session) {
      await session.populate("tutees").execPopulate();
      return session.tutees;
    },
    attendance(session, _, { user }) {
      if (user.userType === "TUTEE") {
        return session.attendance.filter((att) => att.tutee === user._id);
      } else {
        return session.attendance;
      }
    },
  },
  Mutation: {
    async instantiateSession(_, { classId, startTime, length }, { user }) {
      const classDoc = await Class.findById(classId);

      assertSessionInstantiation(user, classDoc);

      const session = await Session.create({
        tutors: classDoc.tutors,
        tutees: classDoc.tutees,
        location: classDoc.location,
        class: classId,
        startTime,
        endTime: addMinutes(startTime, length),
        length,
      });

      // Save session to class
      await Class.updateOne(
        { _id: classId },
        {
          $addToSet: { sessions: session._id },
        }
      );

      // Save session to users
      await User.bulkWrite([
        {
          updateMany: {
            filter: { _id: { $in: classDoc.tutors }, userType: "TUTOR" },
            update: { $addToSet: { sessions: session._id } },
          },
        },
        {
          updateMany: {
            filter: { _id: { $in: classDoc.tutees }, userType: "TUTEE" },
            update: { $addToSet: { sessions: session._id } },
          },
        },
      ]);

      // TODO: Email notify all tutors and tutees
      // const users = await User.find({ _id: { $in: userIds } }, "email");

      return session;
    },
    async updateSession(_, args, { user }) {
      const edits = { ...args };
      if (args.startTime && args.length)
        edits.endTime = addMinutes(args.startTime, args.length);
      const session = await Session.findById(args.id);

      assertGroupAuthorization(user, session.users);

      if (user.userType === "TUTEE") {
        if (session.settings.studentEditNotes) {
          // Only edit the notes
          edits = { notes: args.notes };
        } else {
          throw new ApolloError(
            "Tutees are not permitted to edit in this session",
            401
          );
        }
      }

      if (edits.settings?.syncTutorsWithClass) {
        await session
          .populate({
            path: "class",
            select: "tutors",
          })
          .execPopulate();
        edits.tutors = session.class.tutors;
      }

      return await Session.findByIdAndUpdate(args.id, edits, {
        new: true,
      });
    },
    async deleteSession(_, { id }, { user }) {
      const session = await Session.findById(id);
      if (!session) throw new ApolloError("Session not found", 404);

      if (
        user.userType === "TUTEE" ||
        !assertGroupAuthorization(user, session.users)
      )
        throw new ApolloError("Not authorized to delete session", 401);

      await session.remove();
    },
  },
};
