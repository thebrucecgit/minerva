import Session from "./model";
import Class from "../class/model";
import User from "../user/model";
import Chat from "../chat/model";
import { addMinutes } from "date-fns";
import { format } from "date-fns-tz";
import * as websocket from "../../websocket";
import sgMail from "../../config/email";
import { ApolloError } from "apollo-server";
import { nanoid } from "nanoid";

import {
  assertAuthenticated,
  assertGroupAuthorization,
  assertTutor,
  assertUser,
} from "../../helpers/permissions";

const { FRONTEND_DOMAIN } = process.env;

export default {
  Query: {
    async getSession(_, { id }, { user }) {
      const session = await Session.findById(id);
      assertGroupAuthorization(user, session.users);
      return session;
    },
    async getSessionsOfUser(
      _,
      { userID, limit = 10, old = false, time = new Date() },
      { user }
    ) {
      const targetUser = await User.findById(userID);
      assertUser(user, targetUser);

      return await Session.find(
        {
          $or: [{ tutees: userID }, { tutors: userID }],
          endTime: { [old ? "$lte" : "$gt"]: time },
        },
        null,
        { limit, sort: { startTime: old ? -1 : 1 } }
      );
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
      if (session.tutors.includes(user._id)) return session.attendance;
      else return session.attendance.filter((att) => att.tutee === user._id);
    },
    review(session, _, { user }) {
      if (session.tutors.includes(user._id)) return session.review;
      else return session.review.filter((rev) => rev.tutee === user._id);
    },
  },
  Mutation: {
    async instantiateSession(_, { classId, startTime, length }, { user }) {
      const classDoc = await Class.findById(classId);
      assertGroupAuthorization(user, classDoc.users);

      if (
        !classDoc.preferences.studentInstantiation &&
        !classDoc.tutors.includes(user._id)
      )
        throw new ApolloError("User unauthorized to instantiate session", 401);

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
        author: user._id,
      };

      // Insert event into chat
      if (classDoc.preferences.enableChat) {
        await Chat.findByIdAndUpdate(
          classDoc.chat,
          {
            $push: { messages: event },
          },
          { new: true }
        );
      }
      event._id = nanoid(11);
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

      if (!session.tutors.includes(user._id)) {
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
      let session = await Session.findById(id).populate("class");
      if (!session) throw new ApolloError("Session not found", 404);

      assertGroupAuthorization(user, session.users);

      if (
        !session.class.preferences.studentAgreeSessions &&
        !session.tutors.includes(user._id)
      )
        throw new ApolloError("Not authorized to cancel session", 401);

      if (session.cancellation.cancelled)
        throw new ApolloError("Session is already cancelled");

      session = await Session.findByIdAndUpdate(
        id,
        {
          cancellation: {
            user: user._id,
            cancelled: true,
            reason: reason,
            date: new Date(),
          },
        },
        { new: true, populate: "class" }
      );

      const event = {
        type: "CANCEL_SESSION",
        className: session.class.name,
        sessionId: session._id,
        sessionTime: session.startTime,
        text: `Session on ${format(
          session.startTime,
          "h:mm aa, EEEE d MMMM yyyy"
        )} is cancelled.`,
        time: new Date(),
        author: user._id,
      };

      // Insert event into chat
      if (session.class.preferences.enableChat) {
        await Chat.findByIdAndUpdate(session.class.chat, {
          $push: { messages: event },
        });
        // Notify all users except initiator
        await websocket.broadcast(event, session.users, user._id);
      }

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
          user: user.name,
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
    async reviewSession(_, { id, review }, { user }) {
      const session = await Session.findById(id);
      assertAuthenticated(user);
      if (!session.tutees.includes(user._id))
        throw new Error("Not allowed to create review");
      if (session.review.some((r) => r.tutee === user._id))
        throw new Error("Tutee can't review more than once");
      return await Session.findByIdAndUpdate(
        id,
        {
          $push: { review: { ...review, tutee: user._id } },
        },
        { new: true }
      );
    },
  },
};
