import axios from "axios";
import bcrypt from "bcrypt";
import User from "../model";
import { nanoid } from "nanoid";
import sgMail from "../../../config/email";

import { UserInputError } from "apollo-server";
import { createUserObject } from "../helpers";

const { FRONTEND_DOMAIN, CAPTCHA_SECRET_KEY } = process.env;

export default async function register(_, args) {
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
  const edits = { ...args };
  delete edits.password;

  if (existingUser) {
    if (!existingUser.googleId)
      throw new UserInputError("An user already exists with this email");

    const changedUser = await existingUser.changeUserType(args.userType);

    // Google stategy
    user = await User.findOneAndUpdate(
      { id: changedUser._id, userType: args.userType },
      {
        ...edits,
        confirmed: true,
        registrationStatus:
          args.userType === "TUTOR" ? "PENDING_REVIEW" : "COMPLETE",
      },
      { new: true }
    );
  } else {
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
}
