import User from "../model";
import bcrypt from "bcrypt";
import { UserInputError } from "apollo-server";

import { verifyGoogleToken, createUserObject } from "../helpers";

export default async function login(_, { email, password, tokenId }) {
  let user;
  if (tokenId) {
    // Google Strategy
    const info = await verifyGoogleToken(tokenId);
    const oldUser = await User.findOne({
      $or: [{ googleId: info.sub }, { email: info.email }],
    }).lean();

    const newUser = {
      email: info.email,
      googleId: info.sub,
      name: info.name,
      registrationStatus: oldUser?.registrationStatus ?? "GOOGLE_SIGNED_IN",
      lastAuthenticated: Date.now(),
    };

    if (typeof oldUser.pfp.url === "undefined")
      newUser.pfp = {
        type: "URL",
        url: info.picture,
      };

    console.log(info.picture);

    user = await User.findOneAndUpdate(
      { $or: [{ googleId: info.sub }, { email: info.email }] },
      newUser,
      {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      }
    );
  } else {
    // Local Strategy
    user = await User.findOneAndUpdate(
      { email },
      { lastAuthenticated: Date.now() },
      { new: true }
    );

    if (!user) throw new UserInputError("User not found");

    const pass = await bcrypt.compare(password, user.password);
    if (!pass) throw new UserInputError("The email or password is incorrect");
  }
  return createUserObject(user);
}
