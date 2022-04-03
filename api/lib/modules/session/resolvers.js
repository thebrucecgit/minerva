import Session from "./model";
import Class from "../class/model";
import User from "../user/model";
import Chat from "../chat/model";
import { addMinutes } from "date-fns";
import datetime from "../../config/datetime";
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

import createSession from "./mutations/createSession";
import updateSession from "./mutations/updateSession";

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
      await session.populate("class");
      return session.class;
    },
    async tutors(session) {
      await session.populate("tutors");
      return session.tutors;
    },
    async tutees(session) {
      await session.populate("tutees");
      return session.tutees;
    },
    tuteeReviews(session, _, { user }) {
      if (session.tutors.some((tutor) => tutor._id.isEqual(user._id)))
        return session.tuteeReviews;
      return session.tuteeReviews.filter((r) => r.user._id.isEqual(user._id));
    },
    tutorReviews(session, _, { user }) {
      return session.tutorReviews.filter((r) => r.user._id.isEqual(user._id));
    },
  },
  Mutation: {
    async instantiateSession(_, { classId, startTime, length }, { user }) {
      const classDoc = await Class.findById(classId);
      assertGroupAuthorization(user, classDoc.users);

      if (
        !classDoc.preferences.studentInstantiation &&
        !classDoc.tutors.some((tutor) => tutor._id.isEqual(user._id))
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
        } on ${datetime.format(session.startTime)} for ${classDoc.name}`,
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
      event._id = nanoid();
      // Notify all users except initiator
      await websocket.broadcast(event, session.users, user._id);

      // Email all users
      const users = await User.find(
        { _id: { $in: classDoc.users } },
        "name email"
      );

      const otherUsers = users.filter((u) => !u._id.isEqual(user._id));

      if (otherUsers.length > 0)
        await sgMail.send({
          dynamicTemplateData: {
            request: classDoc.preferences.studentAgreeSessions,
            user: user.name,
            className: classDoc.name,
            sessionTime: datetime.format(session.startTime),
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
          personalizations: otherUsers.map((user) => ({
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
    createSession,
    updateSession,
    async deleteSession(_, { id }, { user }) {
      const session = await Session.findById(id);
      if (!session) throw new ApolloError("Session not found", 404);

      assertGroupAuthorization(user, session.users);
      assertTutor(user);

      await session.remove();
    },
    async cancelSession(_, { id, reason }, { user }) {
      let session = await Session.findById(id);
      if (!session) throw new ApolloError("Session not found", 404);

      assertGroupAuthorization(user, session.users);

      if (session.cancellation.cancelled)
        throw new ApolloError("Session is already cancelled.");

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

      // Email all users
      const users = await User.find(
        { _id: { $in: session.users } },
        "name email"
      );

      const sessionTime = datetime.format(session.startTime);

      await sgMail.send({
        dynamicTemplateData: {
          user: user.name,
          sessionName: session.name,
          sessionTime,
          sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
          reason,
        },
        from: "no-reply@academe.co.nz",
        reply_to: {
          email: "admin@academe.co.nz",
          name: "Admin",
        },
        templateId: "d-66761a69d047412289cbb4dffeb82b38",
        subject: `Session Cancellation: ${session.name}`,
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

      const isTutor = session.tutors.some((t) => t._id.isEqual(user._id));

      if (
        (!isTutor &&
          session.tuteeReviews.some((r) => r.user.isEqual(user._id))) ||
        (isTutor && session.tutorReviews.some((r) => r.user.isEqual(user._id)))
      )
        throw new Error("You can't review more than once");

      return await Session.findByIdAndUpdate(
        id,
        {
          $push: {
            [isTutor ? "tutorReviews" : "tuteeReviews"]: {
              ...review,
              user: user._id,
            },
          },
        },
        { new: true }
      );
    },
  },
};
