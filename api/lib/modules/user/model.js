import { Schema, model } from "mongoose";
import { nanoid } from "nanoid";
import ID from "../../types/ID";

const userSchema = new Schema({
  _id: {
    type: String,
    default: () => new ID(),
    get: (value) => new ID(value),
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
    type: {
      type: String,
      enum: ["URL", "CLOUDINARY"],
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
  tutor: {
    status: {
      type: String,
      enum: ["NONE", "PENDING_REVIEW", "FAILED_REVIEW", "COMPLETE"],
      default: "NONE",
    },
    type: {
      type: String,
      enum: ["LOCAL", "GENERAL"],
    },
    academicsTutoring: [
      {
        type: String,
      },
    ],
    curricula: [
      {
        type: String,
      },
    ],
    academicRecords: [
      {
        id: String,
        name: String,
        size: Number,
        type: {
          type: String,
        },
      },
    ],
    message: {
      type: String,
    },
  },
  admin: {
    status: {
      type: Boolean,
      default: false,
    },
    superAdmin: {
      type: Boolean,
      default: false,
    },
    region: {
      type: String,
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
  yearGroup: {
    type: String,
  },
  school: {
    type: String,
  },
  biography: {
    type: String,
  },
  tertiary: {
    // is the user in a tertiary institution
    type: Boolean, // only required for tutors
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
  });
  const classesChats = classes.map((classInfo) => classInfo.chat);
  return [...this.personalChats, ...classesChats];
};

const User = model("User", userSchema);

export default User;
