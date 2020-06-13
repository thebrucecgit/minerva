import express from "express";

import pusher from "./pusher";
import authenticate from "../../authenticate";

import Chat from "./model";

const router = express.Router();

router.use(express.urlencoded({ extended: true }));
router.use(express.json());

router.get("/", (req, res) => {
  res.send("Reached Academe webhooks");
});

router.post("/auth", async (req, res) => {
  const { socket_id, channel_name, jwt } = req.body;
  const user = await authenticate(jwt);

  console.log(channel_name);
  const auth = pusher.authenticate(socket_id, channel_name);

  // const auth = {};

  // for (const name of channel_name) {
  //   try {
  //     if (!user.chats.includes(name)) throw new Error("Not authorized");

  //     auth[name] = {
  //       status: 200,
  //       data: {
  //         auth: pusher.authenticate(socket_id, name),
  //       },
  //     };
  //   } catch (e) {
  //     auth[name] = {
  //       status: 403,
  //     };
  //   }
  // }

  res.send(auth);
});

router.post("/webhook", (req, res) => {
  console.log(req.body);
  res.end();
});

export default router;
