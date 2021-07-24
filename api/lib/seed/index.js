import {} from "dotenv/config";
import { connect, disconnect } from "../config/database";
import User from "../modules/user/model";
import Class from "../modules/class/model";
import Session from "../modules/session/model";
import Chat from "../modules/chat/model";
import users from "./users.json";
import classes from "./classes.json";
import sessions from "./sessions.json";
import chats from "./chats.json";

(async () => {
  const db = await connect();
  await db.dropDatabase();

  await Promise.all([
    Class.insertMany(classes),
    User.insertMany(users),
    Session.insertMany(sessions),
    Chat.insertMany(chats),
  ]);

  await disconnect();
})();
