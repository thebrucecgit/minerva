import { ApolloError } from "apollo-server";
import User from "../model";
import userSchema from "../yupSchema";
import index, { docToRecord } from "../../../config/search";

export default async function updateUser(_, args, { user }) {
  if (args.id !== user._id) throw new ApolloError("Unauthorized", 401);

  // Verify information
  userSchema.validateSync(args);

  const edits = { ...args };

  const oldUser = await User.findById(edits.id);
  edits["tutor.grades"] = args.grades;

  if (args.applyTutor && oldUser.tutor.status === "NONE") {
    edits["tutor.status"] = "PENDING_REVIEW";
  }
  if (args.applyTutor === false && oldUser.tutor.status !== "NONE") {
    if (oldUser.tutor.status === "COMPLETE") await index.deleteObject(edits.id);
    edits["tutor.status"] = "NONE";
  }
  delete edits.applyTutor;
  delete edits.grades;

  const updated = await User.findByIdAndUpdate(edits.id, edits, {
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
