import { Schema, model } from "mongoose";
import shortid from "shortid";
import Session from "../../session/models/session.model";
import User from "../../user/models/user.model";

const classSchema = Schema({
  _id: {
    type: String,
    default: shortid.generate,
  },
  name: String,
  tags: [String],
  date: String,
  image: String,
  sessions: [
    {
      type: String,
      ref: "Session",
    },
  ],
  tutees: [
    {
      type: String,
      ref: "User",
    },
  ],
  tutors: [
    {
      type: String,
      ref: "User",
    },
  ],
  description: String,
  location: {
    address: String,
    coords: {
      lat: Number,
      lng: Number,
    },
  },
  pricePerTutee: Number,
  preferences: {
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
});

classSchema.pre("remove", async function () {
  await Session.deleteMany({ _id: { $in: this.sessions } });

  await User.bulkWrite([
    {
      updateMany: {
        filter: { _id: { $in: this.tutors }, userType: "TUTOR" },
        update: { $pull: { classes: this._id } },
      },
    },
    {
      updateMany: {
        filter: { _id: { $in: this.tutees }, userType: "TUTEE" },
        update: { $pull: { classes: this._id } },
      },
    },
  ]);
});

const Class = model("Class", classSchema);

export default Class;
