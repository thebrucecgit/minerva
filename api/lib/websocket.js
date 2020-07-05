import WebSocket from "ws";
import * as yup from "yup";
import authenticate from "./authenticate";
import { differenceInMilliseconds } from "date-fns";

import Chat from "./modules/chat/model";
import User from "./modules/user/model";

const { DOMAIN } = process.env;

const eventSchema = yup.object().shape({
  type: yup.string().required().oneOf(["MESSAGE", "INBOX"]),
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

function init(server) {
  const wss = new WebSocket.Server({
    noServer: true,
    path: "/ws",
    maxPayload: 200000, // 200 kB
  });

  wss.on("connection", (ws) => {
    (async () => {
      // Send user events in inbox and clear inbox
      const { inbox } = await User.findByIdAndUpdate(ws.user, { inbox: [] });
      ws.send(
        JSON.stringify({
          type: "INBOX",
          events: inbox,
        })
      );
    })();

    ws.on("message", async (data) => {
      try {
        const event = await eventSchema.validate(data);

        switch (event.type) {
          case "MESSAGE": {
            // Rate limiting
            if (
              ws.lastCalled &&
              differenceInMilliseconds(ws.called, new Date()) <= 100
            ) {
              throw new Error("Client is sending too many events at once");
            }
            ws.lastCalled = new Date();

            event.author = ws.user;
            // Save to DB
            const chat = await Chat.findOneAndUpdate(
              { _id: event.channel },
              { $push: { messages: event } }
            );
            const users = await chat.getUsers();

            // Send to users who are in channel and connected
            const userClients = [];
            for (const client of wss.clients) {
              if (
                client !== ws &&
                users.includes(client.user) &&
                client.readyState === WebSocket.OPEN
              )
                userClients.push(client);
            }

            userClients.forEach((client) => {
              client.send(JSON.stringify(event));
              // Remove from `users`
              const userIndex = users.indexOf(client.user);
              if (userIndex !== -1) users.splice(userIndex, 1);
            });

            // Remove sender
            users.splice(users.indexOf(ws.user), 1);

            // Save to users' inboxes for those in channel but not connected
            await User.updateMany(
              { _id: { $in: users } },
              { $push: { inbox: event } }
            );
            break;
          }
        }
      } catch (e) {
        console.error(e);
      }
    });
  });

  server.on("upgrade", async (req, socket, head) => {
    try {
      const { searchParams } = new URL(req.url, DOMAIN);
      const token = searchParams.get("token");

      const { _id } = await authenticate(token);

      wss.handleUpgrade(req, socket, head, async (ws) => {
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

export default { init };
