import Session from "./model";
import User from "../user/model";

import {
  assertGroupAuthorization,
  assertUser,
} from "../../helpers/permissions";

import createSession from "./mutations/createSession";
import updateSession from "./mutations/updateSession";
import deleteSession from "./mutations/deleteSession";
import cancelSession from "./mutations/cancelSession";
import confirmSession from "./mutations/confirmSession";
import rejectSession from "./mutations/rejectSession";
import reviewSession from "./mutations/reviewSession";

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
    deleteSession,
    cancelSession,
    confirmSession,
    rejectSession,
    reviewSession,
  },
};
