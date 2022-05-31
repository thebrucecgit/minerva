import User from "./model";
import Session from "../session/model";

import login from "./queries/login";

import register from "./mutations/register";
import resetPassword from "./mutations/resetPassword";
import confirmUserEmail from "./mutations/confirmUserEmail";
import updatePassword from "./mutations/updatePassword";
import updateUser from "./mutations/updateUser";
import reviewUser from "./mutations/reviewUser";
import indexTutors from "./mutations/indexTutors";

import { escapeRegExp } from "./helpers";
import {
  assertUser,
  assertUserOrTutor,
  assertTutor,
  assertAdmin,
  assertAuthenticated,
} from "../../helpers/permissions";
import { ApolloError } from "apollo-server";

export default {
  Query: {
    login,
    async getUser(_, { id }, { user }) {
      assertAuthenticated(user);
      if (!id) id = user._id;
      // Not the user himself or a tutor
      const target = (await User.findById(id)).toObject();
      assertUserOrTutor(user, target);
      if (target.tutor.status === "NONE") delete target.tutor;
      return target;
    },
    async getUsers(_, { value }, { user }) {
      assertTutor(user);
      const regex = new RegExp(escapeRegExp(value), "gi");
      // Fuzzy search
      return await User.find({
        $or: [{ email: regex }, { name: regex }],
      });
    },
    async getTutorsOfUser(_, { userID, limit }, { user }) {
      const targetUser = await User.findById(userID);
      assertUser(user, targetUser);

      const sessions = await Session.find({ tutees: userID });

      const tutors = [
        ...new Set(sessions.map((sessionInfo) => sessionInfo.tutors).flat()),
      ];

      return await User.find({ _id: { $in: tutors } }, null, { limit });
    },
    async getTutors(_, __, { user }) {
      return await User.find(
        {
          "tutor.status": "COMPLETE",
          $or: [{ "tutor.type": "NATIONAL" }, { school: user.school }],
        },
        "name"
      );
    },
    async getPendingTutors(_, __, { user }) {
      assertAdmin(user);

      return await User.find({ "tutor.status": "PENDING_REVIEW" });
    },
  },
  User: {
    tutor(reqUser) {
      if (!reqUser.tutor) return null;
      // Added property `parentId` so child resolvers can access userId
      reqUser.tutor.parentId = reqUser._id;
      return reqUser.tutor;
    },
  },
  TutorInfo: {
    academicRecords(tutorInfo, _, { user }) {
      if (!user._id.isEqual(tutorInfo.parentId) && !user.admin.status)
        throw new ApolloError(
          "You do not have permission to access this field"
        );

      return tutorInfo.academicRecords;
    },
  },
  Mutation: {
    register,
    confirmUserEmail,
    resetPassword,
    updatePassword,
    updateUser,
    reviewUser,
    indexTutors,
  },
};
