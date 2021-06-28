import WebSocket from "ws";
import * as yup from "yup";
import authenticate from "./authenticate";
import { differenceInMilliseconds } from "date-fns";

import Chat from "./modules/chat/model";
import User from "./modules/user/model";

const { DOMAIN } = process.env;

const eventSchema = yup.object().shape({
  type: yup
    .string()
    .required()
    .oneOf([
      "MESSAGE",
      "INBOX",
      "NEW_SESSION_REQUEST",
      "NEW_SESSION",
      "CHANGE_SESSION_REQUEST",
      "CHANGE_SESSION",
      "CANCEL_SESSION",
    ]),
  time: yup.date().required(),
  events: yup.array().when("type", {
    is: "INBOX",
    then: yup.array().required(),
  }),
});

const receivedEventSchema = yup.object().shape({
  type: yup.string().required().oneOf(["MESSAGE"]),
  channel: yup.string().when("type", {
    is: "MESSAGE",
    then: yup.string().required(),
  }),
  time: yup.date().required(),
  text: yup.string().when("type", {
    is: "MESSAGE",
    then: yup.string().required(),
  }),
});

let wss;

function heartbeat() {
  this.isAlive = true;
}

function send(ws, event) {
  ws.send(JSON.stringify(event));
}

export async function broadcast(data, endUsers, sender) {
  const event = await eventSchema.validate(data);
  // Send to users who are in channel and connected
  const users = [...endUsers];

  if (Array.isArray(wss?.clients)) {
    for (const client of wss.clients) {
      if (
        client.user !== sender && // Not original sender
        users.includes(client.user) && // In the user list
        client.readyState === WebSocket.OPEN // Socket is open
      ) {
        // Send event
        send(client, event);

        // Remove from `users`
        users.splice(users.indexOf(client.user), 1);
      }
    }
  }

  // Remove sender
  if (sender) users.splice(users.indexOf(sender), 1);

  // Save to users' inboxes for those in list but not connected
  await User.updateMany({ _id: { $in: users } }, { $push: { inbox: event } });
}

export function init(server) {
  wss = new WebSocket.Server({
    noServer: true,
    path: "/ws",
    maxPayload: 200000, // 200 kB
  });

  wss.on("connection", (ws) => {
    ws.isAlive = true;

    ws.on("pong", heartbeat);

    (async () => {
      // Send user events in inbox and clear inbox
      const { inbox } = await User.findByIdAndUpdate(ws.user, { inbox: [] });
      send(ws, {
        type: "INBOX",
        events: inbox,
        time: new Date(),
      });
    })();

    async function onMessage(data) {
      let reqId;
      try {
        const event = await receivedEventSchema.validate(data);

        switch (event.type) {
          case "MESSAGE": {
            reqId = event._id;

            // Rate limiting
            if (
              ws.lastCalled &&
              differenceInMilliseconds(ws.called, new Date()) <= 100
            ) {
              throw new Error("Client is sending too many events at once");
            }
            ws.lastCalled = new Date();

            delete event._id;
            event.author = ws.user;
            // Save to DB
            const chat = await Chat.findById(event.channel);

            const users = await chat.getUsers();

            if (!users.includes(ws.user)) throw new Error("Not authorised");

            await Chat.updateOne(
              { _id: event.channel },
              { $push: { messages: event } }
            );

            await broadcast(event, users, ws.user);

            send(ws, {
              type: "MESSAGE_RESOLVE",
              _id: reqId,
            });
            break;
          }
        }
      } catch (e) {
        console.error(e);
        send(ws, {
          type: "MESSAGE_REJECT",
          _id: reqId,
          message: e.message,
        });
      }
    }

    ws.on("message", onMessage);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping(() => {});
    });
  }, 30000);

  wss.on("close", function close() {
    clearInterval(interval);
  });

  server.on("upgrade", async (req, socket, head) => {
    try {
      const { searchParams } = new URL(req.url, DOMAIN);
      const token = searchParams.get("token");

      const { _id } = await authenticate(token);

      wss.handleUpgrade(req, socket, head, (ws) => {
        ws.user = _id;
        wss.emit("connection", ws);
      });
    } catch (e) {
      console.error(e);
      socket.write("HTTP/1.1 401 Unauthorized\r\n");
      socket.destroy();
    }
  });
}
