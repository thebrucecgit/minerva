import axios from "axios";
import bcrypt from "bcrypt";
import { flatten } from "mongo-dot-notation";
import User from "../model";
import { nanoid } from "nanoid";
import send from "../../../config/email";
import { ApolloError } from "apollo-server";
import * as yup from "yup";

import { UserInputError } from "apollo-server";
import { createUserObject } from "../helpers";
import getAvatar from "../../../helpers/getAvatar";
import schools from "../../../config/schools.json";
import userSchema from "../yupSchema";

const { FRONTEND_DOMAIN, CAPTCHA_SECRET_KEY, NODE_ENV } = process.env;

const registerSchema = userSchema.shape({
  token: yup.string().required(),
  email: yup.string().trim().lowercase().email(),
  password: yup.string(),
});

export default async function register(_, args) {
  if (NODE_ENV === "production") {
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
      throw new ApolloError("Captcha verification failed. ");
  }

  // validation
  let edits;
  try {
    edits = { ...(await registerSchema.validate(args)) };
  } catch (e) {
    throw new UserInputError(e.message);
  }

  let user;
  const existingUser = await User.findOne({ email: args.email });
  delete edits.password;
  delete edits.applyTutor;

  if (!args.pfp?.url) {
    edits.pfp = {
      type: "URL",
      url: getAvatar(args.name),
    };
  }
  if (args.applyTutor) {
    edits["tutor.status"] = "PENDING_REVIEW";
    edits["tutor.type"] =
      schools.find((school) => school.name === args.school).type === "Tertiary"
        ? "GENERAL"
        : "LOCAL";
  }

  if (existingUser) {
    if (!existingUser.googleId)
      throw new UserInputError("An user already exists with this email");

    // Google stategy
    user = await User.findByIdAndUpdate(
      existingUser._id,
      flatten({
        ...edits,
        confirmed: true,
        registrationStatus: "COMPLETE",
      }),
      { new: true }
    );
  } else {
    if (args.password.length < 8)
      throw new UserInputError("Password must have a minimum of 8 characters");

    user = await User.create({
      ...edits,
      password: await bcrypt.hash(args.password, 12),
      registrationStatus: "EMAIL_NOT_CONFIRMED",
      emailConfirmId: nanoid(11),
    });

    // Create confirmation link
    const confirmLink = new URL("/auth/confirm", FRONTEND_DOMAIN);
    confirmLink.searchParams.set("id", user.emailConfirmId);

    // Send email confirmation
    const msg = {
      templateId: "d-6327717732fb4b17bd19727a75a9e5cf",
      subject: "Minerva Education Email Confirmation",
      to: {
        email: user.email,
        name: user.name,
      },
      dynamic_template_data: {
        name: user.name,
        confirmLink: confirmLink.href,
      },
    };

    await send(msg);
  }

  // Return jwt user object
  return createUserObject(user);
}
