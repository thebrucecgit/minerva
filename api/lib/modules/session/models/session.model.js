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
  location: String,
  pricePerTutee: Number,
  time: {
    type: Date,
  },
  notes: String,
});

const Session = model("Session", sessionSchema);

export default Session;
