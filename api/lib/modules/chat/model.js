import { Schema, model } from "mongoose";
import shortid from "shortid";

const chatSchema = Schema({
  channel: {
    type: String,
    default: () => `private-${shortid.generate()}`,
  },
  /* 
  Chat can either be
  1) Binded to a class and all the users are synced with the class, or
  2) Totally separate and have its own designated set of users
  */
  bindToClass: {
    type: Boolean,
    default: false,
  },
  class: {
    type: String,
    ref: "Class",
  },
  users: [
    {
      type: String,
      ref: "User",
    },
  ],
  events: [
    {
      type: {
        type: String,
        enum: ["MESSAGE"],
      },
      time: {
        type: Date,
        default: Date.now,
      },
      text: {
        type: String,
        trim: true,
      },
      author: {
        type: String,
        ref: "User",
      },
    },
  ],
});

const Chat = model("Chat", chatSchema);

export default Chat;
