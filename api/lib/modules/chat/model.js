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
  messages: [
    {
      _id: {
        type: String,
        default: () => nanoid(11),
      },
      type: {
        type: String,
        enum: ["TEXT"],
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
    },
  ],
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
