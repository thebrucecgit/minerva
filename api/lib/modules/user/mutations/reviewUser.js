import User from "../model";
import { FIELDS, addDocToRecord } from "../../../config/search";
import send from "../../../config/email";

export default async function reviewUser(_, { id, approval, message }) {
  const user = await User.findOneAndUpdate(
    { _id: id },
    {
      "tutor.status": approval ? "COMPLETE" : "FAILED_REVIEW",
      "tutor.message": message,
    },
    { new: true, lean: true, projection: [...FIELDS, "email"] }
  );

  if (approval) {
    await addDocToRecord(user);

    const msg = {
      templateId: "d-b4f8c711738b4a73b7cdd4a37ca78573",
      to: {
        email: user.email,
        name: user.name,
      },
      dynamicTemplateData: {
        name: user.name,
      },
    };
    await send(msg);
  }

  return user;
}
