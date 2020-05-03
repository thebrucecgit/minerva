import { Schema, model } from "mongoose";
import shortid from "shortid";

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
});

const Class = model("Class", classSchema);

export default Class;
