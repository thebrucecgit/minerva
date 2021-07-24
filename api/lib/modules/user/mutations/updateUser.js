import { ApolloError } from "apollo-server";
import User from "../model";
import userSchema from "../yupSchema";
import index, { docToRecord } from "../../../config/search";

export default async function updateUser(_, updates, { user }) {
  if (updates.id !== user._id) throw new ApolloError("Unauthorized", 401);

  // Verify information
  userSchema.validateSync(updates);

  const updated = await User.findByIdAndUpdate(updates.id, updates, {
    new: true,
  });

  // Update algolia index
  if (updated.tutor.status === "COMPLETE") {
    await index.partialUpdateObject(docToRecord(updated.toObject()), {
      createIfNotExists: true,
    });
  }

  return updated;
}
