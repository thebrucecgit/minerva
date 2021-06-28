import Session from "./model";
import Class from "../class/model";
import User from "../user/model";
import Chat from "../chat/model";
import { addMinutes } from "date-fns";
import { format } from "date-fns-tz";
import * as websocket from "../../websocket";
import sgMail from "../../config/email";

import {
  assertGroupAuthorization,
  assertSessionInstantiation,
  assertTutor,
} from "../../helpers/permissions";

const { FRONTEND_DOMAIN } = process.env;

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

      assertSessionInstantiation(user, classDoc.toObject({ virtuals: true }));

      const session = await Session.create({
        tutors: classDoc.tutors,
        tutees: classDoc.tutees,
        location: classDoc.location,
        class: classId,
        startTime,
        endTime: addMinutes(startTime, length),
        length,
        userResponses: classDoc.preferences.studentAgreeSessions
          ? [{ user: user._id, response: "CONFIRM" }]
          : [],
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

      const event = {
        type: classDoc.preferences.studentAgreeSessions
          ? "NEW_SESSION_REQUEST"
          : "NEW_SESSION",
        className: classDoc.name,
        sessionId: session._id,
        sessionTime: session.startTime,
        text: `New session ${
          classDoc.preferences.studentAgreeSessions && "requested "
        } on ${format(session.startTime, "h:mm aa, EEEE d MMMM yyyy", {
          timeZone: "Pacific/Auckland",
        })} for ${classDoc.name}`,
        time: new Date(),
      };
      
      let chat;
      // Insert event into chat
      if (classDoc.preferences.enableChat) {
        chat = await Chat.findByIdAndUpdate(classDoc.chat, {
          $push: { messages: event },
        }, { new: true });
      }
      event._id = chat.messages[chat.messages.length-1]._id;
      // Notify all users except initiator
      await websocket.broadcast(event, session.users, user._id);

      // Email all users
      const users = await User.find(
        { _id: { $in: classDoc.users } },
        "name email"
      );

      await sgMail.send({
        dynamicTemplateData: {
          request: classDoc.preferences.studentAgreeSessions,
          user: user.name,
          className: classDoc.name,
          sessionTime: format(session.startTime, "h:mm aa, EEEE d MMMM yyyy", {
            timeZone: "Pacific/Auckland",
          }),
          sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
        },
        from: "no-reply@academe.co.nz",
        reply_to: {
          email: "admin@academe.co.nz",
          name: "Admin",
        },
        templateId: "d-f02579026cf84c5194f7135d838e87ad",
        subject: `New ${
          classDoc.preferences.studentAgreeSessions
            ? "Session Request"
            : "Session"
        } for "${classDoc.name}"`,
        personalizations: users
          .filter((u) => u._id != user._id)
          .map((user) => ({
            to: {
              email: user.email,
              name: user.name,
            },
            dynamicTemplateData: {
              name: user.name,
            },
          })),
      });

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

      assertGroupAuthorization(user, session.users);
      assertTutor(user);

      await session.remove();
    },
    async cancelSession(_, { id, reason }, { user }) {
      const session = await Session.findById(id).populate("class");
      if (!session) throw new ApolloError("Session not found", 404);

      assertGroupAuthorization(user, session.users);

      if (
        user.userType === "TUTEE" &&
        !session.class.preferences.studentAgreeSessions
      )
        throw new ApolloError("Not authorized to delete session", 401);

      await Session.findByIdAndUpdate(id, {
        cancellation: {
          user: user._id,
          cancelled: true,
          reason: reason,
          date: new Date(),
        },
      });

      const event = {
        type: "CANCEL_SESSION",
        className: session.class.name,
        sessionId: session._id,
        sessionTime: session.startTime,
        time: new Date(),
      };

      // Insert event into chat
      if (session.class.preferences.enableChat) {
        await Chat.findByIdAndUpdate(session.class.chat, {
          $push: { messages: event },
        });
      }

      // Notify all users except initiator
      await websocket.broadcast(event, session.users, user._id);

      // Email all users
      const users = await User.find(
        { _id: { $in: session.users } },
        "name email"
      );

      const sessionTime = format(
        session.startTime,
        "h:mm aa, EEEE d MMMM yyyy",
        {
          timeZone: "Pacific/Auckland",
        }
      );

      await sgMail.send({
        dynamicTemplateData: {
          user: user._id,
          className: session.class.name,
          sessionTime,
          sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
        },
        from: "no-reply@academe.co.nz",
        reply_to: {
          email: "admin@academe.co.nz",
          name: "Admin",
        },
        templateId: "d-66761a69d047412289cbb4dffeb82b38",
        subject: `Cancelled Session on ${sessionTime} for "${session.class.name}"`,
        personalizations: users.map((user) => ({
          to: {
            email: user.email,
            name: user.name,
          },
          dynamicTemplateData: {
            name: user.name,
          },
        })),
      });

      return session;
    },
    async confirmSession(_, { id }, { user }) {
      const session = await Session.findById(id);
      assertGroupAuthorization(user, session.users);
      return await Session.findByIdAndUpdate(
        id,
        {
          $push: { userResponses: { user: user._id, response: "CONFIRM" } },
        },
        { new: true }
      );
    },
    async rejectSession(_, { id }, { user }) {
      const session = await Session.findById(id);
      assertGroupAuthorization(user, session.users);
      return await Session.findByIdAndUpdate(
        id,
        {
          $push: { userResponses: { user: user._id, response: "REJECT" } },
        },
        { new: true }
      );
    },
  },
};
