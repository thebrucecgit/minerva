import User from "../../user/model";
import Session from "../../session/model";
import { assertGroupAuthorization } from "../../../helpers/permissions";
import send from "../../../config/email";
import datetime from "../../../config/datetime";
import { ApolloError } from "apollo-server";
import { addMinutes, differenceInHours, subDays } from "date-fns";
import agenda from "../../../agenda";
import fetchCallLink from "../../../helpers/fetchCallLink";

const { FRONTEND_DOMAIN } = process.env;

export default async function updateSession(_, args, { user }) {
  const session = await Session.findById(args.id);

  assertGroupAuthorization(user, session.users);

  let edits = { ...args };
  if (args.startTime && args.length)
    edits.endTime = addMinutes(args.startTime, args.length);

  if (!session.tutors.some((tutor) => tutor._id.isEqual(user._id))) {
    const newEdits = {};
    if (args.startTime && args.length) {
      newEdits.startTime = args.startTime;
      newEdits.endTime = args.endTime;
      newEdits.length = args.length;
    }
    if (session.settings.studentEditNotes && args.notes) {
      // Only edit the notes
      newEdits.notes = args.notes;
    }

    if (Object.values(newEdits).length == 0) {
      throw new ApolloError(
        "You are not permitted to edit in this session",
        403
      );
    }
  }

  if (
    edits.startTime &&
    edits.length &&
    (edits.startTime.getTime() !== session.startTime.getTime() ||
      edits.length !== session.length)
  ) {
    edits.userResponses = [{ user: user._id, response: "CONFIRM" }];
    // Email all users
    const otherUsers = await User.find(
      { _id: { $in: session.users.filter((id) => id !== user._id) } },
      "name email"
    );

    await agenda.cancel({
      name: "session reminder",
      "data.sessionId": session._id,
    });

    if (differenceInHours(edits.startTime, new Date()) >= 30)
      await agenda.schedule(subDays(edits.startTime, 1), "session reminder", {
        sessionId: session._id,
      });

    if (otherUsers.length > 0)
      await send({
        templateId: "d-2a2cbf2125464780b5e3e192326f003d",
        subject: `Session Change for "${session.name}"`,
        dynamicTemplateData: {
          user: user.name,
          sessionName: session.name,
          sessionTime: datetime.format(edits.startTime),
          sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
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

  if (edits.settings?.online && !session.videoLink)
    edits.videoLink = await fetchCallLink(session.name);

  return await Session.findByIdAndUpdate(args.id, edits, {
    new: true,
  });
}
