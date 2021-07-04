import { ApolloError } from "apollo-server";
import User from "../model";

export default async function updateUser(_, updates, { user }) {
  if (updates.id !== user._id && user.userType !== "ADMIN")
    throw new ApolloError("Unauthorized", 401);

  // TODO: Revalidate all other details on email address change

  const updated = await User.findByIdAndUpdate(updates.id, updates, {
    new: true,
  });

  return updated;
}
