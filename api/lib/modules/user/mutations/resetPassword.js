import User from "../model";
import sgMail from "../../../config/email";

export default async function resetPassword(_, { email }) {
  // Create random 6 digit verification code
  const passwordResetCode = Math.floor(100000 + Math.random() * 900000);
  const user = await User.findOneAndUpdate({ email }, { passwordResetCode });
  if (!user) throw new Error("User not found");

  const msg = {
    to: user.email,
    from: {
      email: "passwordreset@academe.co.nz",
      name: "Academe Password Reset",
    },
    reply_to: {
      email: "admin@academe.co.nz",
      name: "Admin",
    },
    templateId: "d-f51e94498ab547fd849abc9a7f1f3386",
    dynamic_template_data: {
      name: user.name,
      resetCode: passwordResetCode,
    },
  };

  await sgMail.send(msg);
}
