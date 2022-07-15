import User from "../model";
import { FIELDS, addDocToRecord } from "../../../config/search";
import send from "../../../config/email";
import { assertAdmin } from "../../../helpers/permissions";

export default async function reviewUser(
  _,
  { id, approval, message },
  { user }
) {
  assertAdmin(user);
  const newUser = await User.findOneAndUpdate(
    { _id: id },
    {
      "tutor.status": approval ? "COMPLETE" : "FAILED_REVIEW",
      "tutor.message": message,
    },
    { new: true, lean: true, projection: [...FIELDS, "email"] }
  );

  if (approval) {
    await addDocToRecord(newUser);

    const msg = {
      templateId: "d-b4f8c711738b4a73b7cdd4a37ca78573",
      to: {
        email: newUser.email,
        name: newUser.name,
      },
      dynamicTemplateData: {
        name: newUser.name,
      },
    };
    await send(msg);
  }

  return newUser;
}
