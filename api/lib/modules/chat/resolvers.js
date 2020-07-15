import Chat from "./model";
import User from "../user/model";

import { assertGroupAuthorization } from "../../helpers/permissions";

export default {
  Query: {
    async getChat(_, { channel }, { user }) {
      const chat = await Chat.findById(channel);
      assertGroupAuthorization(user, await chat.getUsers());
      return chat;
    },
  },
  Chat: {
    async class(chat) {
      await chat.populate("class").execPopulate();
      return chat.class;
    },
    async users(chat) {
      const userIds = await chat.getUsers();
      const users = await User.find({ _id: { $in: userIds } });
      return users;
    },
  },
};
