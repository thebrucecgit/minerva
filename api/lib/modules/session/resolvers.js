import Session from "./models/session.model";
import Class from "../class/models/class.model";
import User from "../user/models/user.model";
import { addMinutes } from "date-fns";

import { validateInstantiation } from "../../helpers";

export default {
  Query: {
    async getSession(_, { id }, { user }) {
      // Not a tutor nor a part of this session
      if (user.userType !== "TUTOR" && !user.sessions.toObject().includes(id))
        throw Error("Not authorized", 401);
      return await Session.findById(id);
    },
    async getSessions(
      _,
      { time = new Date(), old = false, limit = 10 },
      { user },
      { fieldNodes }
    ) {
      const req = fieldNodes.find((node) => node.name?.value === "getSessions");
      const selections = req.selectionSet.selections.map(
        (selection) => selection.name.value
      );
      let projection = {};

      // Add Apollo selections to Mongoose projections
      selections.forEach((path) => {
        projection[path] = 1;
      });

      if (user.userType === "TUTEE") {
        if (selections.includes("attendance"))
          projection.attendance = {
            $elemMatch: { tutee: user._id, attended: true },
          };
        else delete projection.attendance;
      }

      await user
        .populate({
          path: "sessions",
          match: {
            endTime: { [old ? "$lte" : "$gt"]: time },
          },
          select: projection,
          limit,
          options: {
            sort: { startTime: old ? -1 : 1 },
          },
        })
        .execPopulate();

      return user.sessions;
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
  },
  Mutation: {
    async instantiateSession(_, { classId, startTime, length }, { user }) {
      const classDoc = await Class.findById(classId);

      if (!validateInstantiation(user, classDoc))
        throw Error("Not authorized to instantiate session", 401);

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

      if (user.userType === "TUTEE") {
        if (!session.tutees.includes(user._id))
          throw Error("You are not part of this session", 401);
        if (session.settings.studentEditNotes) edits = { notes: args.notes };
        else
          throw Error("Tutees are not permitted to edit in this session", 401);
      } else if (user.userType !== "TUTOR") {
        throw Error("Not authorized", 401);
      } else if (
        user.userType === "TUTOR" &&
        !session.tutors.toObject().includes(user._id)
      ) {
        throw Error("You are not part of this session", 401);
      }

      return await Session.findByIdAndUpdate(args.id, edits, {
        new: true,
      });
    },
    async deleteSession(_, { id }, { user }) {
      const session = await Session.findById(id);
      if (!session) throw new Error("Session not found", 404);

      if (!(user.userType === "TUTOR" && session.tutors.includes(user._id)))
        throw Error("Not authorized to delete session", 401);

      await session.remove();
    },
  },
};
