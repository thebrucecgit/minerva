import jwt from "jsonwebtoken";
import axios from "axios";
import sgMail from "../../config/email";
import shortid from "shortid";
import { OAuth2Client } from "google-auth-library";
import bcrypt from "bcrypt";

import {
  AuthenticationError,
  UserInputError,
  ApolloError,
} from "apollo-server";
import User from "./models/user.model";

const { FRONTEND_DOMAIN, JWT_SECRET, CAPTCHA_SECRET_KEY } = process.env;

const client = new OAuth2Client();

const verifyGoogleToken = async (idToken) => {
  const ticket = await client.verifyIdToken({ idToken });
  return ticket.getPayload();
};

function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

const createUserObject = (user) => {
  return {
    jwt: jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    }),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    user,
  };
};

export default {
  Query: {
    async getUser(_, { id }, { user }) {
      // Not the user himself or a tutor
      if (user.userType !== "TUTOR" && user._id !== id)
        throw new Error("Not authorized", 401);
      return await User.findById(id);
    },
    async getUsers(_, { value, userType }, { user }) {
      if (user.userType !== "TUTOR") throw new Error("Not authorized", 401);
      const regex = new RegExp(escapeRegExp(value), "gi");

      // Fuzzy search
      return await User.find({
        userType,
        $or: [{ email: regex }, { name: regex }],
      });
    },
    async getTutors(_, { limit }, { user }) {
      const populated = await user.populate("classes").execPopulate();

      const tutorsArray = populated.classes
        .toObject()
        .map((classInfo) => classInfo.tutors.toObject());

      const tutors = [...new Set([].concat(...tutorsArray))];

      return await User.find(
        { _id: { $in: tutors }, userType: "TUTOR" },
        null,
        { limit }
      );
    },
    async login(_, { email, password, tokenId }) {
      try {
        let user;
        if (tokenId) {
          const info = await verifyGoogleToken(tokenId);
          const oldUser = await User.findOne({ googleId: info.sub });

          const newUser = {
            email: info.email,
            pfp: info.picture,
            googleId: info.sub,
            name: info.name,
            registrationStatus:
              oldUser?.registrationStatus ?? "GOOGLE_SIGNED_IN",
            lastAuthenticated: Date.now(),
          };

          user = await User.findOneAndUpdate({ googleId: info.sub }, newUser, {
            new: true,
            upsert: true,
            setDefaultsOnInsert: true,
          });
        } else {
          user = await User.findOneAndUpdate(
            { email },
            { lastAuthenticated: Date.now() },
            { new: true }
          );

          if (!user) throw new UserInputError("User not found");

          const pass = await bcrypt.compare(password, user.password);
          if (!pass)
            throw new UserInputError("The email or password is incorrect");
        }
        return createUserObject(user);
      } catch (e) {
        console.error(e);
      }
    },
  },
  User: {
    async classes(user, _, { user: reqUser }) {
      if (reqUser.userType !== "TUTOR")
        throw new ApolloError("User unauthorized for this field", 401);
      await user.populate("classes").execPopulate();
      return user.classes;
    },
    async sessions(user, _, { user: reqUser }) {
      if (reqUser.userType !== "TUTOR")
        throw new ApolloError("User unauthorized for this field", 401);
      await user.populate("sessions").execPopulate();
      return user.sessions;
    },
  },
  Mutation: {
    async register(_, args) {
      // Verify information

      // Verify Captcha
      const captchaVerification = await axios({
        method: "post",
        url: "https://www.google.com/recaptcha/api/siteverify",
        params: {
          response: args.token,
          secret: CAPTCHA_SECRET_KEY,
        },
      });

      if (!captchaVerification.data.success)
        throw new Error("Captcha verification failed. ");

      let user;
      const existingUser = await User.findOne({ email: args.email });

      const newUser = { ...args };
      delete newUser.token;

      if (existingUser) {
        // Google stategy
        if (!existingUser.googleId)
          throw new UserInputError("An user already exists with this email");

        // Delete temporary google user
        const oldUser = await User.findOneAndDelete({ email: args.email });
        oldUser.toObject();

        delete newUser.password;

        user = await User.create({
          ...newUser,
          email: oldUser.email,
          googleId: oldUser.googleId,
          _id: oldUser._id,
          confirmed: true,
          registrationStatus: "COMPLETE",
        });
      } else {
        // Hash password
        newUser.password = await bcrypt.hash(args.password, 12);
        newUser.registrationStatus = "EMAIL_NOT_CONFIRMED";
        newUser.emailConfirmId = shortid.generate();
        user = await User.create(newUser);

        const confirmLink = new URL("/auth/confirm", FRONTEND_DOMAIN);
        confirmLink.searchParams.set("id", user.emailConfirmId);

        // Send email confirmation
        const msg = {
          to: user.email,
          from: {
            email: "confirmation@academe.co.nz",
            name: "Academe Email Confirmation",
          },
          reply_to: {
            email: "admin@academe.co.nz",
            name: "Admin",
          },
          templateId: "d-a83cebeb53ac40f490e8dab85ee2b80f",
          dynamic_template_data: {
            name: user.name,
            confirmLink: confirmLink.href,
          },
        };

        await sgMail.send(msg);
      }

      // Return jwt user object
      return createUserObject(user);
    },
    async confirmUserEmail(_, { emailConfirmId }) {
      const user = await User.findOneAndUpdate(
        { emailConfirmId },
        { registrationStatus: "COMPLETE" },
        { new: true }
      );
      if (!user) throw new Error("User not found");
      return createUserObject(user);
    },
    async resetPassword(_, { email }) {
      const passwordResetCode = Math.floor(100000 + Math.random() * 900000);
      const user = await User.findOneAndUpdate(
        { email },
        { passwordResetCode }
      );
      if (!user) return;

      const msg = {
        to: user.email,
        from: {
          email: "passwordreset@academe.co.nz",
          name: "Academe Password Reset",
        },
        reply_to: {
          email: "admin@academe.co.nz",
          name: "Admin",
        },
        templateId: "d-f51e94498ab547fd849abc9a7f1f3386",
        dynamic_template_data: {
          name: user.name,
          resetCode: passwordResetCode,
        },
      };

      await sgMail.send(msg);
    },
    async updatePassword(
      _,
      { email, passwordResetCode, newPassword },
      { user }
    ) {
      const update = user ?? (await User.findOne({ email, passwordResetCode }));
      if (!update) throw new Error("Failed to change password");
      update.passwordResetCode = undefined;
      update.password = await bcrypt.hash(newPassword, 12);
      await update.save();
      return createUserObject(update);
    },
  },
};
