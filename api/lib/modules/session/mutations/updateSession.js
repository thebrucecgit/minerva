import User from "../../user/model";
import Session from "../../session/model";
import { assertGroupAuthorization } from "../../../helpers/permissions";
import send from "../../../config/email";
import datetime from "../../../config/datetime";
import { ApolloError } from "apollo-server";
import {
  addMinutes,
  differenceInHours,
  differenceInMinutes,
  subDays,
} from "date-fns";
import agenda from "../../../agenda";
import fetchCallLink from "../../../helpers/fetchCallLink";

const { FRONTEND_DOMAIN } = process.env;

export default async function updateSession(_, args, { user }) {
  const session = await Session.findById(args.id)
    .populate("tutees", "name email")
    .populate("tutors", "name email");

  assertGroupAuthorization(user, session.users);

  let edits = { ...args };

  if (!session.tutors.some((tutor) => tutor._id.isEqual(user._id))) {
    const newEdits = {};
    if (args.startTime && args.length) {
      newEdits.startTime = args.startTime;
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
    edits = newEdits;
  }

  if (edits.startTime && edits.length)
    edits.endTime = addMinutes(edits.startTime, edits.length);

  if (
    edits.startTime &&
    edits.length &&
    (edits.startTime.getTime() !== session.startTime.getTime() ||
      edits.length !== session.length)
  ) {
    edits.userResponses = [{ user: user._id, response: "CONFIRM" }];

    await agenda.cancel({ "data.sessionId": session._id });

    if (differenceInHours(edits.startTime, new Date()) >= 30) {
      await agenda.schedule(subDays(edits.startTime, 1), "session reminder", {
        sessionId: session._id,
      });
    }

    if (differenceInMinutes(edits.endTime, new Date()) >= -15) {
      await agenda.schedule(
        addMinutes(edits.endTime, 15),
        "session review reminder",
        {
          sessionId: session._id,
        }
      );
    }

    const otherUsers = session.users.filter((u) => !user._id.isEqual(u._id));
    if (
      otherUsers.length > 0 &&
      differenceInMinutes(edits.startTime, new Date()) >= 0
    ) {
      // Email all users
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
  }

  if (edits.settings?.online && !session.videoLink) {
    edits.videoLink = await fetchCallLink(session.name);
  }

  return await Session.findByIdAndUpdate(args.id, edits, {
    new: true,
  });
}
