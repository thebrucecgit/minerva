import { Schema, model } from "mongoose";
import shortid from "shortid";

const sessionSchema = Schema({
  _id: {
    type: String,
    default: shortid.generate,
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
});

const Session = model("Session", sessionSchema);

export default Session;
