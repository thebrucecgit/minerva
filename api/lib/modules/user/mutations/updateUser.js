import { ApolloError } from "apollo-server";
import User from "../model";
import userSchema from "../yupSchema";
import index, { docToRecord } from "../../../config/search";

export default async function updateUser(_, updates, { user }) {
  if (updates.id !== user._id && user.userType !== "ADMIN")
    throw new ApolloError("Unauthorized", 401);

  // Verify information
  userSchema.validateSync(updates);

  const updated = await User.findByIdAndUpdate(updates.id, updates, {
    new: true,
  });

  // Update algolia index
  if (updated.userType === "TUTOR") {
    await index.saveObject(docToRecord(updated.toObject()));
  }

  return updated;
}
