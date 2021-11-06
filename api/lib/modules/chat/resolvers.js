import Chat from "./model";
import User from "../user/model";

import {
  assertGroupAuthorization,
  assertUser,
} from "../../helpers/permissions";

export default {
  Query: {
    async getChat(_, { channel }, { user }) {
      const chat = await Chat.findById(channel);
      assertGroupAuthorization(user, await chat.getUsers());
      return chat;
    },
    async getChatsOfUser(_, { userID }, { user }) {
      const targetUser = await User.findById(userID);
      assertUser(user, targetUser);
      return await Chat.find({ users: userID });
    },
  },
  Mutation: {
    async createChat(_, { targets }, { user }) {
      const targetUsers = [...new Set([...targets, user._id])];

      if (targetUsers.length <= 1)
        throw new Error("Can't message yourself", 400);

      return await Chat.findOneAndUpdate(
        {
          bindToClass: false,
          users: {
            $all: targetUsers.map((u) => ({ $elemMatch: { $eq: u } })),
            $size: targetUsers.length,
          },
        },
        { users: targetUsers },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    },
  },
  Chat: {
    async class(chat) {
      await chat.populate("class");
      return chat.class;
    },
    async users(chat) {
      const users = await chat.getUsers();
      return await User.find({ _id: { $in: users.map((user) => user._id) } });
    },
  },
};
