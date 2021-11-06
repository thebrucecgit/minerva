import {} from "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as db from "../../config/database";
import sgMail from "../../config/email";
import User from "../user/model";
import Chat from "./model";
import onMessage from "./onMessage";
import { broadcast, send } from "../../websocket";
import ID from "../../types/ID";

jest.mock("@sendgrid/mail");
jest.mock("../../websocket");
sgMail.send.mockResolvedValue();
broadcast.mockResolvedValue();

let mongod;
beforeAll(async () => {
  mongod = new MongoMemoryServer();
  await db.connect(await mongod.getUri());
});

afterAll(async () => {
  await db.disconnect();
  await mongod.stop();
});

describe("Message tests", () => {
  beforeAll(async () => {
    await Promise.all([
      User.create([
        {
          _id: "1",
          name: "Ben Smith",
          email: "ben@example.com",
        },
        {
          _id: "2",
          name: "Sam Johnson",
          email: "sam@example.com",
        },
        {
          _id: "3",
          name: "James James",
          email: "james@example.com",
        },
        {
          _id: "4",
          name: "Evil Jones",
          email: "evil@example.com",
        },
      ]),
      Chat.create({
        _id: "1",
        bindToClass: false,
        users: ["1", "2", "3"],
        lastMessageSent: new Date(1630000000000),
      }),
    ]);
  });
  afterEach(() => {
    sgMail.send.mockClear();
    broadcast.mockClear();
    send.mockClear();
  });

  test("Unauthorized message send to group", async () => {
    let err;
    const ws = { user: "4", id: "1" };
    try {
      await onMessage(
        {
          _id: "requestid",
          type: "MESSAGE",
          channel: "1",
          time: new Date(1636171671027),
          text: "Hi, this is a test message. Please ignore.",
        },
        ws
      );
    } catch (e) {
      err = e;
    }
    expect(err.message.toLowerCase()).toMatch(/unauthorized/);
  });

  test("Send new message to group with email", async () => {
    sgMail.send.mockResolvedValue();
    broadcast.mockResolvedValue();

    const ws = { user: "2", id: "1" };
    await onMessage(
      {
        _id: "requestid",
        type: "MESSAGE",
        channel: "1",
        time: new Date(1636171671027),
        text: "Hi, this is a test message. Please ignore.",
      },
      ws
    );

    const chat = await Chat.findById("1");
    expect(chat.messages).toMatchObject([
      {
        text: "Chat Created",
        type: "CREATION",
      },
      {
        type: "MESSAGE",
        time: new Date(1636171671027),
        text: "Hi, this is a test message. Please ignore.",
        author: new ID("2"),
      },
    ]);

    expect(broadcast.mock.calls[0][0]).toMatchObject({
      channel: "1",
      type: "MESSAGE",
      time: new Date(1636171671027),
      text: "Hi, this is a test message. Please ignore.",
      author: "2",
      authorName: "Sam Johnson",
    });
    expect(broadcast.mock.calls[0][1]).toMatchObject([
      {
        _id: new ID("1"),
        name: "Ben Smith",
        email: "ben@example.com",
      },
      {
        _id: new ID("2"),
        name: "Sam Johnson",
        email: "sam@example.com",
      },
      {
        _id: new ID("3"),
        name: "James James",
        email: "james@example.com",
      },
    ]);
    expect(broadcast.mock.calls[0][2]).toBe("2");
    expect(broadcast.mock.calls[0][3]).toBe("1");

    expect(send.mock.calls[0][0]).toMatchObject(ws);
    expect(send.mock.calls[0][1]).toMatchObject({
      type: "MESSAGE_RESOLVE",
      _id: "requestid",
    });

    expect(sgMail.send.mock.calls[0][0]).toMatchObject({
      from: {
        email: "chat@academe.co.nz",
        name: "Chat",
      },
      subject: "New message from Sam Johnson",
      templateId: "d-7414703086e342908972b9e187499820",
      dynamic_template_data: {
        author: "Sam Johnson",
        message: "Hi, this is a test message. Please ignore.",
        chatLink: `${process.env.FRONTEND_DOMAIN}/dashboard/chats/1`,
      },
      personalizations: [
        {
          to: "ben@example.com",
          dynamic_template_data: {
            name: "Ben Smith",
          },
        },
        {
          to: "james@example.com",
          dynamic_template_data: {
            name: "James James",
          },
        },
      ],
    });
  });

  test("Send new message to group without email", async () => {
    const ws = { user: "2", id: "1" };
    await onMessage(
      {
        _id: "requestid",
        type: "MESSAGE",
        channel: "1",
        time: new Date(1636171671027),
        text: "Hi, this is a test message #2. Please ignore.",
      },
      ws
    );
    expect(sgMail.send.mock.calls.length).toBe(0);
  });
});
