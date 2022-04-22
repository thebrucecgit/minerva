import User from "../model";
import send from "../../../config/email";

export default async function resetPassword(_, { email }) {
  // Create random 6 digit verification code
  const passwordResetCode = Math.floor(100000 + Math.random() * 900000);
  const user = await User.findOneAndUpdate({ email }, { passwordResetCode });
  if (!user) return;

  const msg = {
    templateId: "d-02ecc5c486f14da1957ce5e6422cfb9a",
    subject: "Minerva Password Reset",
    to: {
      email: user.email,
      name: user.name,
    },
    dynamic_template_data: {
      name: user.name,
      resetCode: passwordResetCode,
    },
  };

  await send(msg);
}
