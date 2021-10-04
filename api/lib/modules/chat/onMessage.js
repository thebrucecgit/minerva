import Chat from "./model";
import User from "../user/model";
import { broadcast, send } from "../../websocket";
import { nanoid } from "nanoid";

export default async function onMessage(event, ws) {
  let reqId = event._id;

  event._id = nanoid(11);
  event.author = ws.user;
  // Save to DB
  const chat = await Chat.findById(event.channel);

  const users = await chat.getUsers();

  if (!users.includes(ws.user)) throw new Error("Not authorised");

  const { name } = await User.findById(ws.user, "name");
  event.authorName = name;

  await Chat.updateOne({ _id: event.channel }, { $push: { messages: event } });

  await broadcast(event, users, ws.user, ws.id);

  send(ws, {
    type: "MESSAGE_RESOLVE",
    _id: reqId,
  });
}
