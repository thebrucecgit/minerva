import Chat from "./model";
import User from "../user/model";
import { broadcast } from "../../websocket";

import {
  assertGroupAuthorization,
  assertUser,
} from "../../helpers/permissions";

export default {
  Query: {
    async getChat(_, { channel, limit = 20, skip = 0 }, { user }) {
      const chat = await Chat.findById(channel, {
        messages: {
          $slice: [-(skip + limit), limit],
        },
      });
      assertGroupAuthorization(user, await chat.getUsers());
      return chat;
    },
    async getChatsOfUser(_, { userID }, { user }) {
      const targetUser = await User.findById(userID);
      assertUser(user, targetUser);
      return await Chat.find({ users: userID }, { messages: { $slice: -1 } });
    },
  },
  Mutation: {
    async createChat(_, { targets }, { user }) {
      const targetUsers = [...new Set([...targets, user._id])].sort();

      if (targetUsers.length <= 1)
        throw new Error("Can't message yourself", 400);

      const chatInfo = await Chat.findOneAndUpdate(
        {
          bindToClass: false,
          users: targetUsers,
        },
        { users: targetUsers },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      await broadcast(
        {
          type: "CHANNEL_CREATE",
          time: new Date(),
          channel: chatInfo._id,
        },
        chatInfo.users,
        user._id
      );

      return chatInfo;
    },
  },
  Chat: {
    async class(chat) {
      await chat.populate("class");
      return chat.class;
    },
    async users(chat) {
      const users = await chat.getUsers();
      const userIds = users.map((user) => user._id);
      const res = await User.find(
        { _id: { $in: userIds } },
        "name tutor.status"
      );
      return userIds.map(
        (userId) =>
          res.find((u) => u._id.isEqual(userId)) ?? {
            _id: userId,
            name: "Deleted User",
          }
      );
    },
  },
};
