import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import Session from "../session/model";
import ID from "../../types/ID";

const classSchema = Schema({
  _id: {
    type: String,
    default: () => nanoid(11),
  },
  name: {
    type: String,
    required: true,
  },
  tags: {
    type: [String],
    default: ["Mathematics", "English"],
  },
  date: {
    type: String,
    default: "Saturdays, 3pm",
  },
  image: {
    type: String,
    default:
      "https://images.unsplash.com/photo-1543165796-5426273eaab3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
  },
  sessions: [
    {
      type: String,
      ref: "Session",
    },
  ],
  tutees: [
    {
      type: String,
      get: (value) => new ID(value),
      ref: "User",
    },
  ],
  tutors: [
    {
      type: String,
      get: (value) => new ID(value),
      ref: "User",
    },
  ],
  description: {
    type: String, // Stringified JSON
  },
  location: {
    address: String,
    coords: {
      lat: Number,
      lng: Number,
    },
  },
  pricePerTutee: {
    type: Number,
    default: 10,
  },
  videoLink: String,
  preferences: {
    online: {
      type: Boolean,
      default: false,
    },
    enableChat: {
      type: Boolean,
      default: true,
    },
    publicClass: {
      type: Boolean,
      default: false,
    },
    studentInstantiation: {
      type: Boolean,
      default: false,
    },
    studentAgreeSessions: {
      type: Boolean,
      default: false,
    },
  },
  chat: {
    type: String,
    ref: "Chat",
  },
});

classSchema.virtual("users").get(function () {
  return [...(this.tutees ?? []), ...(this.tutors ?? [])];
});

classSchema.pre("remove", async function () {
  await Session.deleteMany({ _id: { $in: this.sessions } });
});

const Class = model("Class", classSchema);

export default Class;
