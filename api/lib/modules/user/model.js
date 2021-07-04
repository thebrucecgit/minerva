import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";

const userSchema = new Schema({
  // "userType" is discriminator key
  _id: {
    type: String,
    default: () => nanoid(11),
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
    enum: [
      "GOOGLE_SIGNED_IN",
      "EMAIL_NOT_CONFIRMED",
      "PENDING_REVIEW",
      "COMPLETE",
    ],
  },
  emailConfirmId: String,
  // Profile picture
  pfp: {
    type: {
      type: String,
      enum: ["URL", "CLOUDINARY"],
      default: "URL",
    },
    url: {
      type: String,
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      trim: true,
    },
  },
  personalChats: [
    {
      type: String,
      ref: "Chat",
    },
  ],
  inbox: [
    {
      _id: {
        type: String,
        default: () => nanoid(11),
      },
      type: {
        type: String,
        required: true,
      },
      text: String,
      time: Date,
      channel: String,
    },
  ],
  dateJoined: {
    type: Date,
    default: Date.now(),
  },
  lastAuthenticated: {
    type: Date,
    default: Date.now(),
  },
  userType: {
    type: String,
    required: true,
  },
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
});

userSchema.methods.getChats = async function () {
  const { classes } = await this.populate({
    path: "classes",
    select: "chat",
    match: { "preferences.enableChat": true },
  }).execPopulate();
  const classesChats = classes.map((classInfo) => classInfo.chat);
  return [...this.personalChats, ...classesChats];
};

const User = model("User", userSchema);

export default User;
