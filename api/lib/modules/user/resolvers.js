import User from "./model";
import Chat from "../chat/model";
import { ApolloError } from "apollo-server";

import login from "./queries/login";

import register from "./mutations/register";
import resetPassword from "./mutations/resetPassword";
import confirmUserEmail from "./mutations/confirmUserEmail";
import updatePassword from "./mutations/updatePassword";

import { escapeRegExp } from "./helpers";

export default {
  Query: {
    login,
    async getUser(_, { id }, { user }) {
      // Not the user himself or a tutor
      if (user.userType !== "TUTOR" && user._id !== id)
        throw new Error("Not authorized", 401);
      return await User.findById(id);
    },
    async getUsers(_, { value, userType }, { user }) {
      if (user.userType !== "TUTOR") throw new Error("Not authorized", 401);
      const regex = new RegExp(escapeRegExp(value), "gi");

      // Fuzzy search
      return await User.find({
        userType,
        $or: [{ email: regex }, { name: regex }],
      });
    },
    async getTutors(_, { limit }, { user }) {
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
    async classes(user, _, { user: reqUser }) {
      if (reqUser.userType !== "TUTOR" && reqUser._id !== user._id)
        throw new ApolloError("User unauthorized for this field", 401);
      await user.populate("classes").execPopulate();
      return user.classes;
    },
    async sessions(user, _, { user: reqUser }) {
      if (reqUser.userType !== "TUTOR" && reqUser._id !== user._id)
        throw new ApolloError("User unauthorized for this field", 401);
      await user.populate("sessions").execPopulate();
      return user.sessions;
    },
    async chats(user, _, { user: reqUser }) {
      if (reqUser.userType !== "TUTOR" && reqUser._id !== user._id)
        throw new ApolloError("User unauthorized for this field", 401);
      const chats = await user.getChats();
      return await Chat.find({ _id: { $in: chats } });
    },
  },
  Mutation: {
    register,
    confirmUserEmail,
    resetPassword,
    updatePassword,
  },
};
