import axios from "axios";
import bcrypt from "bcrypt";
import { flatten } from "mongo-dot-notation";
import User from "../model";
import { nanoid } from "nanoid";
import sgMail from "../../../config/email";
import userSchema from "../yupSchema";
import { ApolloError } from "apollo-server";
import * as yup from "yup";

import { UserInputError } from "apollo-server";
import { createUserObject } from "../helpers";
import getAvatar from "../../../helpers/getAvatar";

import whitelist from "../../../config/whitelist.json";

const { FRONTEND_DOMAIN, CAPTCHA_SECRET_KEY, NODE_ENV } = process.env;

const userSchema = yup.object().shape({
  token: yup.string().required(),
  name: yup.string().min(3).trim(),
  email: yup.string().trim().lowercase().email(),
  password: yup.string(),
  yearGroup: yup.string().oneOf(Object.keys(whitelist.year)),
  biography: yup.string().trim().min(2),
  school: yup
    .string()
    .required()
    .when("yearGroup", {
      is: (val) => whitelist.school[val],
      then: (schema) =>
        schema.oneOf(
          Object.entries(whitelist.school)
            .filter((s) => s[1])
            .map((s) => s[0])
        ),
      otherwise: (schema) =>
        schema.oneOf(
          Object.entries(whitelist.school)
            .filter((s) => !s[1])
            .map((s) => s[0])
        ),
    }),
  applyTutor: yup.boolean().required(),
  tutor: yup.mixed().when("applyTutor", {
    is: true,
    then: (schema) =>
      schema.object({
        academicsTutoring: yup
          .array()
          .of(yup.string())
          .oneOf(whitelist.academic),
        curricula: yup.array().of(yup.string()).oneOf(whitelist.curricula),
        price: yup.number().required().integer().min(0).max(100),
        online: yup.boolean().required(),
        location: yup.string().required().oneOf(whitelist.location),
        academicRecords: yup.array(),
      }),
    otherwise: (schema) => schema.nullable(),
  }),
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
    edits = { ...(await userSchema.validate(args)) };
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
    edits["tutor.type"] = whitelist.school[args.school] ? "GENERAL" : "LOCAL";
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
      to: {
        email: user.email,
        name: user.name,
      },
      from: {
        email: "confirmation@academe.co.nz",
        name: "Academe Email Confirmation",
      },
      reply_to: {
        email: "admin@academe.co.nz",
        name: "Admin",
      },
      templateId: "d-6327717732fb4b17bd19727a75a9e5cf",
      dynamic_template_data: {
        name: user.name,
        confirmLink: confirmLink.href,
      },
    };

    await sgMail.send(msg);
  }

  // Return jwt user object
  return createUserObject(user);
}
