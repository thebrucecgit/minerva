import Chat from "./model";
import User from "../user/model";
import { broadcast, send } from "../../websocket";
import { nanoid } from "nanoid";
import emailSend from "../../config/email";
import { differenceInMinutes } from "date-fns";

const { FRONTEND_DOMAIN } = process.env;

export default async function onMessage(event, ws) {
  let reqId = event._id;

  event._id = nanoid();
  event.author = ws.user;
  // Save to DB
  const oldChat = await Chat.findById(event.channel, "-messages").populate(
    "users",
    "name email"
  );
  const users = await oldChat.getUsers();

  if (!users.some((user) => user._id.isEqual(ws.user)))
    throw new Error("Unauthorized");

  const author = await User.findById(ws.user, "name");
  event.authorName = author.name;

  await Chat.updateOne(
    { _id: event.channel },
    { $push: { messages: event }, lastMessageSent: new Date() }
  );

  await broadcast(event, users, ws.user, ws.id);

  send(ws, {
    type: "MESSAGE_RESOLVE",
    _id: reqId,
  });

  const otherUsers = users.filter((user) => !user._id.isEqual(author._id));

  if (
    differenceInMinutes(new Date(), oldChat.lastMessageSent) > 10 &&
    otherUsers.length > 0
  ) {
    const msg = {
      templateId: "d-7414703086e342908972b9e187499820",
      subject: `New message from ${author.name}`,
      dynamicTemplateData: {
        author: author.name,
        message: event.text,
        chatLink: `${FRONTEND_DOMAIN}/dashboard/chats/${event.channel}`,
      },
      personalizations: otherUsers.map((user) => ({
        to: user.email,
        dynamicTemplateData: {
          name: user.name,
        },
      })),
    };
    await emailSend(msg);
  }
}
