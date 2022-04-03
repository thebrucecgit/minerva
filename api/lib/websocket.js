import WebSocket from "ws";
import * as yup from "yup";
import authenticate from "./authenticate";
import { differenceInMilliseconds } from "date-fns";
import { nanoid } from "nanoid";

import User from "./modules/user/model";
import onMessage from "./modules/chat/onMessage";

const { DOMAIN } = process.env;

const eventSchema = yup.object().shape({
  _id: yup.string().required(),
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

export function send(ws, event) {
  ws.send(JSON.stringify(event));
}

export async function broadcast(
  data,
  users,
  senderUserId = "",
  senderWsId = ""
) {
  if (!data._id) data._id = nanoid(11);

  // internal validation:
  const event = await eventSchema.validate(data);

  // Send to users who are in channel and connected, excluding sender

  const sentUsers = new Set();

  if (typeof wss?.clients !== "undefined") {
    for (const client of wss.clients) {
      if (
        client.id !== senderWsId && // Not original sender client
        users.some((user) => user._id.isEqual(client.user)) && // In the user list
        client.readyState === WebSocket.OPEN // Socket is open
      ) {
        // Send event
        send(client, event);
        sentUsers.add(client.user);
      }
    }
  }

  // Save to users' inboxes for those in list but not connected
  await User.updateMany(
    {
      _id: {
        $in: users.filter(
          (user) =>
            !user._id.isEqual(senderUserId) &&
            !sentUsers.has(user._id.valueOf())
        ),
      },
    },
    { $push: { inbox: event } }
  );
}

export function init(server) {
  wss = new WebSocket.Server({
    noServer: true,
    path: "/ws",
    maxPayload: 20000, // 20 kB
  });

  wss.on("connection", (ws) => {
    ws.isAlive = true;
    ws.id = nanoid();

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

    async function onEvent(data) {
      let reqId;
      try {
        const event = await receivedEventSchema.validate(data.toString());
        reqId = event._id;

        // Rate limiting
        if (
          ws.lastCalled &&
          differenceInMilliseconds(ws.called, new Date()) <= 100
        ) {
          throw new Error("Client is sending too many events at once");
        }
        ws.lastCalled = new Date();

        switch (event.type) {
          case "MESSAGE": {
            await onMessage(event, ws);
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

    ws.on("message", onEvent);
  });

  const interval = setInterval(() => {
    wss.clients.forEach((ws) => {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 30000);

  wss.on("close", function close() {
    clearInterval(interval);
  });

  server.on("upgrade", async (req, socket, head) => {
    try {
      const { searchParams } = new URL(req.url, DOMAIN);
      const token = searchParams.get("token");

      const user = await authenticate(token);
      if (!user) throw new Error("Not authenticated");

      wss.handleUpgrade(req, socket, head, (ws) => {
        ws.user = user._id.valueOf(); // primitive string value
        wss.emit("connection", ws);
      });
    } catch (e) {
      console.error(e);
      socket.write("HTTP/1.1 401 Unauthorized\r\n");
      socket.destroy();
    }
  });

  return wss;
}
