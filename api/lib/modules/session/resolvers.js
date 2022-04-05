import Session from "./model";
import Class from "../class/model";
import User from "../user/model";
import Chat from "../chat/model";
import { addMinutes } from "date-fns";
import datetime from "../../config/datetime";
import * as websocket from "../../websocket";
import send from "../../config/email";
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

      await send({
        templateId: "d-66761a69d047412289cbb4dffeb82b38",
        subject: `Session Cancellation: ${session.name}`,
        dynamicTemplateData: {
          user: user.name,
          sessionName: session.name,
          sessionTime,
          sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
          reason,
        },
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
