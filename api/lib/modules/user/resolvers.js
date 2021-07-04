import User from "./model";
import Chat from "../chat/model";
import { ApolloError } from "apollo-server";

import login from "./queries/login";

import register from "./mutations/register";
import resetPassword from "./mutations/resetPassword";
import confirmUserEmail from "./mutations/confirmUserEmail";
import updatePassword from "./mutations/updatePassword";
import updateUser from "./mutations/updateUser";

import { escapeRegExp } from "./helpers";
import {
  assertAuthenticated,
  assertUser,
  assertUserOrTutor,
  assertTutor,
} from "../../helpers/permissions";

export default {
  Query: {
    login,
    async getUser(_, { id }, { user }) {
      if (!id) id = user._id;
      // Not the user himself or a tutor
      assertUserOrTutor(user, { _id: id });
      return await User.findById(id);
    },
    async getUsers(_, { value, userType }, { user }) {
      assertTutor(user);
      const regex = new RegExp(escapeRegExp(value), "gi");

      // Fuzzy search
      return await User.find({
        userType,
        $or: [{ email: regex }, { name: regex }],
      });
    },
    async getTutors(_, { limit }, { user }) {
      // TODO: Authorization
      assertAuthenticated(user);
      const populated = await user
        .populate({
          path: "classes",
          options: {
            lean: true,
          },
        })
        .execPopulate();

      const tutorsArray = populated.classes.map(
        (classInfo) => classInfo.tutors
      );

      const tutors = [...new Set([].concat(...tutorsArray))];

      return await User.find(
        { _id: { $in: tutors }, userType: "TUTOR" },
        null,
        { limit }
      );
    },
  },
  User: {
    async classes(user, { limit }, { user: reqUser }) {
      assertUser(reqUser, user);
      await user
        .populate({
          path: "classes",
          limit,
        })
        .execPopulate();
      return user.classes;
    },
    async sessions(
      user,
      { time = new Date(), old = false, limit = 10 },
      { user: reqUser }
    ) {
      assertUser(reqUser, user);
      await user
        .populate({
          path: "sessions",
          match: {
            endTime: { [old ? "$lte" : "$gt"]: time },
          },
          limit,
          options: {
            sort: { startTime: old ? -1 : 1 },
          },
        })
        .execPopulate();

      return user.sessions;
    },
    async chats(user, _, { user: reqUser }) {
      assertUser(reqUser, user);
      const chats = await user.getChats();
      return await Chat.find({ _id: { $in: chats } });
    },
  },
  Mutation: {
    register,
    confirmUserEmail,
    resetPassword,
    updatePassword,
    updateUser,
  },
};
