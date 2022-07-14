import User from "../model";
import bcrypt from "bcrypt";
import { subDays } from "date-fns";

import { createUserObject } from "../helpers";

export default async function updatePassword(
  _,
  { email, passwordResetCode, newPassword },
  { user }
) {
  const update =
    user ??
    (await User.findOne({
      email,
      "passwordReset.code": passwordResetCode,
      "passwordReset.requested": { $gte: subDays(new Date(), 1) },
    }));
  if (!update) throw new Error("Failed to change password");
  update.passwordReset = undefined;
  update.password = await bcrypt.hash(newPassword, 12);
  await update.save();
  return createUserObject(update);
}
