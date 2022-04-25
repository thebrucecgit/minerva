import Session from "../model";
import User from "../../user/model";
import { assertGroupAuthorization } from "../../../helpers/permissions";
import agenda from "../../../agenda";
import send from "../../../config/email";
import datetime from "../../../config/datetime";

const { FRONTEND_DOMAIN } = process.env;

export default async function rejectSession(_, { id }, { user }) {
  const session = await Session.findById(id);
  assertGroupAuthorization(user, session.users);
  await agenda.cancel({ "data.sessionId": id });

  const newSession = await Session.findByIdAndUpdate(
    id,
    {
      $push: { userResponses: { user: user._id, response: "REJECT" } },
    },
    { new: true }
  );

  const otherUsers = await User.find(
    { _id: { $in: newSession.users.filter((id) => !user._id.isEqual(id)) } },
    "name email"
  );

  await send({
    templateId: "d-a0e044745b7746428c8c71d2dba59132",
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

  return newSession;
}
