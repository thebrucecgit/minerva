import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";

const chatSchema = Schema({
  _id: {
    type: String,
    default: () => nanoid(11),
    alias: "channel",
  },
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
  messages: {
    type: [
      {
        _id: {
          type: String,
          default: () => nanoid(11),
        },
        type: {
          type: String,
          enum: [
            "CREATION",
            "MESSAGE",
            "NEW_SESSION_REQUEST",
            "NEW_SESSION",
            "CHANGE_SESSION_REQUEST",
            "CHANGE_SESSION",
            "CANCEL_SESSION",
          ],
          required: true,
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
        sessionId: String,
        sessionTime: Date,
      },
    ],
    default: [{ type: "CREATION", text: "Chat Created" }],
  },
});

chatSchema.methods.getUsers = async function () {
  if (this.bindToClass) {
    const req = await this.populate({
      path: "class",
      select: "tutors tutees users",
    }).execPopulate();
    return req.class.users;
  } else {
    return this.users;
  }
};

const Chat = model("Chat", chatSchema);

export default Chat;
