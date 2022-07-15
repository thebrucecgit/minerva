import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import ID from "../../types/ID";

const tutorRequestSchema = Schema({
  _id: {
    type: String,
    default: () => nanoid(11),
  },
  requester: {
    type: String,
    get: (value) => new ID(value),
    ref: "User",
    required: true,
  },
  subject: String,
  curriculum: String,
  other: String,
  date: {
    type: Date,
    default: () => new Date(),
  },
  status: {
    type: String,
    enum: ["PENDING", "COMPLETE", "FAIL"],
  },
});

const TutorRequest = model("TutorRequest", tutorRequestSchema);

export default TutorRequest;
