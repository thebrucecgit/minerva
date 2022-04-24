import Session from "../model";
import User from "../../user/model";
import { assertGroupAuthorization } from "../../../helpers/permissions";
import agenda from "../../../agenda";
import send from "../../../config/email";
import datetime from "../../../config/datetime";
import { ApolloError } from "apollo-server";

const { FRONTEND_DOMAIN } = process.env;

export default async function cancelSession(_, { id, reason }, { user }) {
  let session = await Session.findById(id);
  if (!session) throw new ApolloError("Session not found", 404);

  assertGroupAuthorization(user, session.users);

  if (session.cancellation.cancelled)
    throw new ApolloError("Session is already cancelled.");

  await agenda.cancel({ "data.sessionId": id });

  session = await Session.findByIdAndUpdate(
    id,
    {
      cancellation: {
        user: user._id,
        cancelled: true,
        reason: reason,
        date: new Date(),
      },
    },
    { new: true, populate: "class" }
  );

  // Email all users
  const otherUsers = await User.find(
    { _id: { $in: session.users.filter((id) => id !== user._id) } },
    "name email"
  );

  await send({
    templateId: "d-66761a69d047412289cbb4dffeb82b38",
    dynamicTemplateData: {
      user: user.name,
      sessionName: session.name,
      sessionTime: datetime.format(session.startTime),
      sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
      reason,
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

  return session;
}
