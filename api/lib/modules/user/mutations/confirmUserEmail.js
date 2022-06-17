import User from "../model";
import { createUserObject } from "../helpers";
import send from "../../../config/email";

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

  // Send welcome email
  if (user.tutor.status === "NONE") {
    const msg = {
      templateId: "d-b3807c15e4994fa394e7a739917008ca",
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

  return createUserObject(user);
}
