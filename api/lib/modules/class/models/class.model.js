import { Schema, model } from "mongoose";
import shortid from "shortid";

const classSchema = Schema({
  _id: {
    type: String,
    default: shortid.generate,
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
  location: String,
  pricePerTutee: Number,
});

const Class = model("Class", classSchema);

export default Class;
