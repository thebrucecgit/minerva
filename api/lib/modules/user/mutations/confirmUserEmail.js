import User from "../model";
import { createUserObject } from "../helpers";

export default async function confirmUserEmail(_, { emailConfirmId }) {
  const existingUser = await User.findOne({ emailConfirmId });
  if (!existingUser) throw new Error("User not found");

  const user = await User.findOneAndUpdate(
    { emailConfirmId },
    {
      registrationStatus: "COMPLETE",
    },
    { new: true }
  );
  return createUserObject(user);
}
