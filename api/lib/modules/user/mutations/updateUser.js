import { ApolloError } from "apollo-server";
import { flatten } from "mongo-dot-notation";
import User from "../model";
import userSchema from "../yupSchema";
import index, { docToRecord } from "../../../config/search";
import getAvatar from "../../../helpers/getAvatar";
import schools from "../../../config/schools.json";

export default async function updateUser(_, args, { user }) {
  if (!user._id.isEqual(args.id)) throw new ApolloError("Unauthorized", 401);

  userSchema.validateSync(args);

  const edits = { ...args };
  const oldUser = await User.findById(edits.id);

  if (!args.pfp?.url) {
    edits.pfp = {
      type: "URL",
      url: getAvatar(args.name ?? oldUser.name),
    };
  }

  if (args.applyTutor && oldUser.tutor.status === "NONE") {
    edits["tutor.status"] = "PENDING_REVIEW";
    edits["tutor.type"] =
      schools.find((school) => school.name === edits.school ?? oldUser.school)
        .type === "Tertiary"
        ? "GENERAL"
        : "LOCAL";
  } else if (args.applyTutor === false && oldUser.tutor.status !== "NONE") {
    if (oldUser.tutor.status === "COMPLETE") await index.deleteObject(edits.id);
    edits["tutor.status"] = "NONE";
  }
  delete edits.applyTutor;
  const updated = await User.findByIdAndUpdate(edits.id, flatten(edits), {
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
