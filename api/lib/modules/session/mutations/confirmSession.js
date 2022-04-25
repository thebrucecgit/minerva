import Session from "../model";
import User from "../../user/model";
import { assertGroupAuthorization } from "../../../helpers/permissions";
import send from "../../../config/email";
import datetime from "../../../config/datetime";

const { FRONTEND_DOMAIN } = process.env;

export default async function confirmSession(_, { id }, { user }) {
  const session = await Session.findById(id);
  assertGroupAuthorization(user, session.users);
  const newSession = await Session.findByIdAndUpdate(
    id,
    {
      $push: { userResponses: { user: user._id, response: "CONFIRM" } },
    },
    { new: true }
  );

  if (newSession.status === "CONFIRM") {
    const otherUsers = await User.find(
      { _id: { $in: newSession.users.filter((id) => !user._id.isEqual(id)) } },
      "name email"
    );
    await send({
      templateId: "d-55a426ab431d4c2db6f726a63b4ff968",
      dynamicTemplateData: {
        sessionName: newSession.name,
        sessionTime: datetime.format(newSession.startTime),
        sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${newSession._id}`,
      },
      personalizations: otherUsers.map((user) => ({
        to: {
          email: user.email,
          name: user.name,
        },
        dynamicTemplateData: {
          name: user.name,
        },
      })),
    });
  }

  return newSession;
}
