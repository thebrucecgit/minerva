import User from "../../user/model";
import Session from "../../session/model";
import * as websocket from "../../../websocket";
import send from "../../../config/email";
import datetime from "../../../config/datetime";
import { nanoid } from "nanoid";

import {
  addMinutes,
  differenceInHours,
  differenceInMinutes,
  subDays,
} from "date-fns";
import { UserInputError } from "apollo-server";
import agenda from "../../../agenda";
import fetchCallLink from "../../../helpers/fetchCallLink";

const { FRONTEND_DOMAIN } = process.env;

export default async function createSession(
  _,
  { name, tutors, tutees, startTime, length, online, location },
  { user }
) {
  const users = [...tutors, ...tutees];
  if (!users.some((id) => user._id.isEqual(id)))
    throw new UserInputError("Must include yourself as participant");

  const session = await Session.create({
    name,
    tutors,
    tutees,
    startTime,
    endTime: addMinutes(startTime, length),
    length,
    location,
    "settings.online": online,
    userResponses: [{ user: user._id, response: "CONFIRM" }],
    videoLink: online ? await fetchCallLink(name) : null,
  });

  const event = {
    type: "NEW_SESSION_REQUEST",
    name: name,
    sessionId: session._id,
    sessionTime: session.startTime,
    text: `New session requested on ${datetime.format(session.startTime)}`,
    time: new Date(),
    author: user._id,
  };

  if (differenceInHours(session.startTime, new Date()) >= 30) {
    await agenda.schedule(subDays(session.startTime, 1), "session reminder", {
      sessionId: session._id,
    });
  }

  if (differenceInMinutes(session.endTime, new Date()) >= -15) {
    await agenda.schedule(
      addMinutes(session.endTime, 15),
      "session review reminder",
      {
        sessionId: session._id,
      }
    );
  }

  event._id = nanoid();
  // Notify all users except initiator
  await websocket.broadcast(event, session.users, user._id);

  // Email all users
  await session.populate([
    {
      path: "tutees",
      select: "name email",
    },
    {
      path: "tutors",
      select: "name email",
    },
  ]);

  const otherUsers = session.users.filter((u) => !user._id.isEqual(u._id));

  if (
    otherUsers.length > 0 &&
    differenceInMinutes(session.startTime, new Date()) >= 0
  ) {
    await send({
      templateId: "d-e2dc24a92d804398b0e5312f621285e4",
      subject: `New Session Request for "${session.name}"`,
      dynamicTemplateData: {
        user: user.name,
        sessionName: session.name,
        sessionTime: datetime.format(session.startTime),
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

  return session;
}
