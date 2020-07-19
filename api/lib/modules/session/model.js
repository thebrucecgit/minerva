import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import Class from "../class/model";
import User from "../user/model";

const sessionSchema = Schema({
  _id: {
    type: String,
    default: () => nanoid(11),
  },
  class: {
    type: String,
    ref: "Class",
  },
  tutors: [
    {
      type: String,
      ref: "User",
    },
  ],
  tutees: [
    {
      type: String,
      ref: "User",
    },
  ],
  attendance: [
    {
      tutee: {
        type: String,
        ref: "User",
      },
      attended: {
        type: Boolean,
        default: false,
      },
      reason: String,
    },
  ],
  location: {
    address: String,
    coords: {
      lat: Number,
      lng: Number,
    },
  },
  settings: {
    online: {
      type: Boolean,
      default: false,
    },
    studentEditNotes: {
      type: Boolean,
      default: false,
    },
    syncTutorsWithClass: {
      type: Boolean,
      default: true,
    },
    syncTuteesWithClass: {
      type: Boolean,
      default: true,
    },
  },
  pricePerTutee: Number,
  startTime: Date,
  endTime: Date,
  length: Number, // in minutes
  notes: String,
  userResponses: [
    {
      user: {
        type: String,
        ref: "User",
        required: true,
      },
      response: {
        type: String,
        required: true,
        enum: ["CONFIRM", "REJECT"],
      },
    },
  ],
  cancellation: {
    cancelled: {
      type: Boolean,
      default: false,
    },
    reason: String,
    date: Date,
  },
});

sessionSchema.pre("remove", async function () {
  await Class.updateOne({ _id: this.class }, { $pull: { sessions: this._id } });

  await User.bulkWrite([
    {
      updateMany: {
        filter: { _id: { $in: this.tutors }, userType: "TUTOR" },
        update: { $pull: { sessions: this._id } },
      },
    },
    {
      updateMany: {
        filter: { _id: { $in: this.tutees }, userType: "TUTEE" },
        update: { $pull: { sessions: this._id } },
      },
    },
  ]);
});

sessionSchema.virtual("users").get(function () {
  return [...(this.tutees ?? []), ...(this.tutors ?? [])];
});

sessionSchema.virtual("status").get(function () {
  if (this.cancellation.cancelled) return "CANCEL";
  return this.userResponses
    .toObject()
    .every((value) => value.response === "CONFIRM")
    ? "CONFIRM"
    : "REJECT";
});

const Session = model("Session", sessionSchema);

export default Session;
