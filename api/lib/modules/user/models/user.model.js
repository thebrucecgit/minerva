import { Schema, model } from "mongoose";
import shortid from "shortid";

const userSchema = new Schema(
  {
    // "userType" is discriminator key
    _id: {
      type: String,
      default: shortid.generate,
    },
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      trim: true,
    },
    googleId: {
      type: String,
    },
    password: {
      type: String,
    },
    passwordResetCode: Number,
    registrationStatus: {
      type: String,
      enum: ["GOOGLE_SIGNED_IN", "EMAIL_NOT_CONFIRMED", "COMPLETE"],
    },
    emailConfirmId: String,
    // Profile picture
    pfp: {
      type: String,
      trim: true,
    },
    dateJoined: {
      type: Date,
      default: Date.now(),
    },
    lastAuthenticated: {
      type: Date,
      default: Date.now(),
    },
  },
  {
    discriminatorKey: "userType",
  }
);

const User = model("User", userSchema);

const studentSchema = {
  yearGroup: {
    type: Number,
  },
  school: {
    type: String,
  },
  academics: [
    {
      type: String,
    },
  ],
  extras: [
    {
      type: String,
    },
  ],
  biography: {
    type: String,
  },
  classes: [
    {
      type: String,
      ref: "Class",
    },
  ],
  sessions: [
    {
      type: String,
      ref: "Session",
    },
  ],
};

User.discriminator(
  "TUTOR",
  Schema({
    ...studentSchema,
    price: {
      type: Number,
    },
  })
);

User.discriminator(
  "TUTEE",
  Schema({
    ...studentSchema,
    parent: {
      type: String,
      ref: "User",
    },
  })
);

export default User;
