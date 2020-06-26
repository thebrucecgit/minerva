import User from "../model";
import { FIELDS, addDocToRecord } from "../../../config/search";

export default async function reviewUser(_, { id, approval, message }) {
  const user = await User.select(FIELDS).findOneAndUpdate(
    { _id: id, userType: "TUTOR" },
    {
      registrationStatus: approval ? "COMPLETE" : "FAILED_REVIEW",
    },
    { new: true, lean: true }
  );

  if (approval) await addDocToRecord(user);
}
