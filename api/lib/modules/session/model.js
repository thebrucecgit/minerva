import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import Class from "../class/model";
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
  review: [
    {
      tutee: {
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
  attendance: [
    {
      tutee: {
        type: String,
        ref: "User",
        get: (value) => new ID(value),
      },
      attended: {
        type: Boolean,
        default: false,
      },
      reason: String,
      behaviourTags: [String],
      behaviourComment: String,
      behaviourGood: Boolean,
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
  await Class.updateOne({ _id: this.class }, { $pull: { sessions: this._id } });
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

  // If no response from any tutor
  if (
    !userResponses.some((value) =>
      tutors.some((tutor) => tutor._id.isEqual(value.user))
    )
  )
    return "UNCONFIRM";

  // If not every tutee has responded
  if (
    userResponses.filter((u) =>
      tutees.some((tutee) => tutee._id.isEqual(u.user))
    ).length < tutees.length
  )
    return "UNCONFIRM";

  // If at least one tutor has confirmed and all tutees have confirmed:
  return "CONFIRM";
});

const Session = model("Session", sessionSchema);

export default Session;
