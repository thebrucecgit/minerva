import Chat from "./model";
import pusher from "./pusher";

export default {
  Query: {
    async getChat(_, { channel }, { user }) {
      if (!user.chats.includes(channel)) throw new Error("Authorization error");

      return await Chat.findOne({ channel });
    },
  },
  Mutation: {
    async sendEvent(_, { channel, event }, { user }) {
      if (!user.chats.includes(channel)) throw new Error("Authorization error");

      const evt = { ...event, author: user._id };

      pusher.trigger(channel, evt.type, evt);

      await Chat.updateOne(
        { channel },
        { $push: { events: evt } },
        { upsert: true }
      );
    },
  },
  Chat: {
    async class(chat) {
      await chat.populate("class").execPopulate();
      return chat.class;
    },
    async users(chat) {
      await chat.populate("users").execPopulate();
      return chat.users;
    },
  },
};
