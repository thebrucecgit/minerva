import User from "../model";
import sgMail from "../../../config/email";

export default async function resetPassword(_, { email }) {
  // Create random 6 digit verification code
  const passwordResetCode = Math.floor(100000 + Math.random() * 900000);
  const user = await User.findOneAndUpdate({ email }, { passwordResetCode });
  if (!user) throw new Error("User not found");

  const msg = {
    to: {
      email: user.email,
      name: user.name,
    },
    from: {
      email: "passwordreset@academe.co.nz",
      name: "Academe Password Reset",
    },
    reply_to: {
      email: "admin@academe.co.nz",
      name: "Admin",
    },
    templateId: "d-02ecc5c486f14da1957ce5e6422cfb9a",
    dynamic_template_data: {
      name: user.name,
      resetCode: passwordResetCode,
    },
  };

  await sgMail.send(msg);
}
