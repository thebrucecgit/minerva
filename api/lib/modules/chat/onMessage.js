import Chat from "./model";
import { broadcast } from "../../websocket";

export default async function onMessage(event, ws) {
  reqId = event._id;

  delete event._id;
  event.author = ws.user;
  // Save to DB
  const chat = await Chat.findById(event.channel);

  const users = await chat.getUsers();

  if (!users.includes(ws.user)) throw new Error("Not authorised");

  await Chat.updateOne({ _id: event.channel }, { $push: { messages: event } });

  await broadcast(event, users, ws.user);

  send(ws, {
    type: "MESSAGE_RESOLVE",
    _id: reqId,
  });
}
