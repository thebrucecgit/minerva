import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import agenda from "../../agenda";
import ID from "../../types/ID";

const sessionSchema = Schema({
  _id: {
    type: String,
    default: () => nanoid(11),
  },
  name: {
    type: String,
    default: "Unnamed Class",
  },
  class: {
    type: String,
    ref: "Class",
  },
  tutors: [
    {
      type: String,
      get: (value) => new ID(value),
      ref: "User",
    },
  ],
  tutees: [
    {
      type: String,
      get: (value) => new ID(value),
      ref: "User",
    },
  ],
  tuteeReviews: [
    // tutee reviews of session & tutor
    {
      _id: {
        type: String,
        default: () => nanoid(11),
      },
      user: {
        type: String,
        get: (value) => new ID(value),
        ref: "User",
      },
      rating: Number, // out of 5.0 scale
      occurred: String,
      reason: String,
      comment: String,
    },
  ],
  tutorReviews: [
    // tutor reviews on session & tutee
    {
      _id: {
        type: String,
        default: () => nanoid(11),
      },
      user: {
        type: String,
        get: (value) => new ID(value),
        ref: "User",
      },
      rating: Number, // out of 5.0 scale
      occurred: String,
      reason: String,
      comment: String,
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
    // syncTutorsWithClass: {
    //   type: Boolean,
    //   default: true,
    // },
    // syncTuteesWithClass: {
    //   type: Boolean,
    //   default: true,
    // },
  },
  pricePerTutee: Number,
  startTime: Date,
  endTime: Date,
  length: Number, // in minutes
  notes: String,
  videoLink: String,
  userResponses: [
    {
      user: {
        type: String,
        ref: "User",
        get: (value) => new ID(value),
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
    user: {
      type: String,
      ref: "User",
      get: (value) => new ID(value),
    },
    cancelled: {
      type: Boolean,
      default: false,
    },
    reason: String,
    date: Date,
  },
});

sessionSchema.pre("remove", async function () {
  await agenda.cancel({ "data.sessionId": this._id });
});

sessionSchema.virtual("users").get(function () {
  return [...(this.tutees ?? []), ...(this.tutors ?? [])];
});

sessionSchema.virtual("status").get(function () {
  if (this.cancellation.cancelled) return "CANCEL";
  const userResponses = this.userResponses.toObject();
  const tutors = this.tutors.toObject();
  const tutees = this.tutees.toObject();

  // If anyone responded with "REJECT", reject overall
  if (userResponses.some((value) => value.response === "REJECT"))
    return "REJECT";

  // every tutor & tutee must have responded
  if (userResponses.length === tutees.length + tutors.length) return "CONFIRM";
  return "UNCONFIRM";
});

const Session = model("Session", sessionSchema);

export default Session;
