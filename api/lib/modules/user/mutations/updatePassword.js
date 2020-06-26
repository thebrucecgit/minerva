import User from "../model";
import bcrypt from "bcrypt";

import { createUserObject } from "../helpers";

export default async function updatePassword(
  _,
  { email, passwordResetCode, newPassword },
  { user }
) {
  // TODO
  const update = user ?? (await User.findOne({ email, passwordResetCode }));
  if (!update) throw new Error("Failed to change password");
  update.passwordResetCode = undefined;
  update.password = await bcrypt.hash(newPassword, 12);
  await update.save();
  return createUserObject(update);
}
