import { Schema, model } from "mongoose";
import shortid from "shortid";
import Class from "../../class/models/class.model";
import User from "../../user/models/user.model";

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

const Session = model("Session", sessionSchema);

export default Session;
