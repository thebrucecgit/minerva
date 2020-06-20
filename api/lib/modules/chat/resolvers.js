import Chat from "./model";
import User from "../user/model";

export default {
  Query: {
    async getChat(_, { channel }, { user }) {
      const chats = await user.getChats();
      if (!chats.includes(channel)) throw new Error("Authorization error");

      return await Chat.findById(channel);
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
