import {} from "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as db from "../../config/database";
import resolvers from "./resolvers";
import chatResolvers from "../chat/resolvers";
import User from "../user/model";
import Class from "../class/model";
import Chat from "../chat/model";
import Session from "./model";
import sgMail from "@sendgrid/mail";

jest.mock("@sendgrid/mail");

let mongod, tutor, tutee, classDoc, chat, session;

beforeAll(async () => {
  mongod = new MongoMemoryServer();
  await db.connect(await mongod.getUri());

  tutor = await User.create({
    _id: "1",
    userType: "TUTOR",
    name: "Ben Smith",
    email: "ben@example.com",
    pfp: {
      type: "URL",
      url: "https://images.unsplash.com/photo-1601699165292-b3b1acd6472c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&h=250&q=80",
    },
    yearGroup: 12,
    school: "Example4 High School",
    academics: ["Geography", "Mathematics"],
    extras: ["Piano"],
    biography: "You never know.",
    classes: ["1"],
    sessions: ["1"],
    // grades: "---",
  });

  tutee = await User.create({
    _id: "2",
    userType: "TUTEE",
    name: "John Smith",
    email: "john@example.com",
    pfp: {
      type: "URL",
      url: "https://images.unsplash.com/photo-1601699165292-b3b1acd6472c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&h=250&q=80",
    },
    yearGroup: 13,
    school: "Example High School",
    academics: ["English", "Mathematics"],
    extras: ["Coding"],
    biography: "You always know.",
    classes: ["1"],
    sessions: ["1"],
    // grades: "---",
  });

  classDoc = await Class.create({
    _id: "1",
    tags: ["Mathematics", "English"],
    date: "Saturdays, 4pm",
    image:
      "https://images.unsplash.com/photo-1543165796-5426273eaab3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
    sessions: [],
    tutees: ["2"],
    tutors: ["1"],
    name: "Sunday Afternoon Maths",
    location: {
      address:
        "Upper Riccarton, Upper Riccarton, Christchurch 8041, New Zealand",
      coords: { lat: -43.5319765, lng: 172.57373 },
    },
    description:
      '{"ops":[{"insert":"\\"At vero eos et accusamus et iusto odio dignissimos ducimus qui blanditiis praesentium voluptatum deleniti atque corrupti quos dolores et quas molestias excepturi sint occaecati cupiditate non provident, similique sunt in culpa qui officia deserunt mollitia animi, id est laborum et dolorum fuga. Et harum quidem rerum facilis est et expedita distinctio. "},{"attributes":{"align":"justify"},"insert":"\\n\\n"},{"insert":"Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat facere possimus, omnis voluptas assumenda est, omnis dolor repellendus. Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet ut et voluptates repudiandae sint et molestiae non recusandae. "},{"attributes":{"align":"justify"},"insert":"\\n\\n"},{"insert":"Itaque earum rerum hic tenetur a sapiente delectus, ut aut reiciendis voluptatibus maiores alias consequatur aut perferendis doloribus asperiores repellat.\\""},{"attributes":{"align":"justify"},"insert":"\\n"}]}',
    videoLink: "https://join.skype.com/WmG7eDM28MQF",
    chat: "1",
  });

  chat = await Chat.create({
    _id: "1",
    bindToClass: true,
    class: "1",
    users: ["1", "2"],
  });
});

afterAll(async () => {
  await db.disconnect();
  await mongod.stop();
});

describe("Creation and deletion", () => {
  test("Unauthorized instantiate session", async () => {
    classDoc.preferences.studentInstantiation = false;
    await classDoc.save();
    let err;
    try {
      const startTime = new Date(1687917600000); // Wed Jun 28 2023 14:00:00 GMT+1200
      await resolvers.Mutation.instantiateSession(
        null,
        {
          classId: classDoc._id,
          startTime,
          length: 60,
        },
        { user: tutee }
      );
    } catch (e) {
      err = e;
    }
    expect(err.message).toMatch(/unauthorized/);
  });

  test("Authorized instantiate session", async () => {
    sgMail.send.mockResolvedValue();

    classDoc.preferences.studentInstantiation = true;
    classDoc.preferences.studentAgreeSession = false;
    await classDoc.save();
    const startTime = new Date(1687917600000); // Wed Jun 28 2023 14:00:00 GMT+1200
    await resolvers.Mutation.instantiateSession(
      null,
      {
        classId: classDoc._id,
        startTime,
        length: 60,
      },
      { user: tutee }
    );

    expect(sgMail.send.mock.calls[0][0]).toMatchObject({
      dynamicTemplateData: {
        request: false,
        user: "John Smith",
        className: "Sunday Afternoon Maths",
        sessionTime: "2:00 PM, Wednesday 28 June 2023",
        // sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
      },
      from: "no-reply@academe.co.nz",
      reply_to: {
        email: "admin@academe.co.nz",
        name: "Admin",
      },
      templateId: "d-f02579026cf84c5194f7135d838e87ad",
      subject: `New Session for "Sunday Afternoon Maths"`,
      personalizations: [
        {
          to: {
            email: "ben@example.com",
            name: "Ben Smith",
          },
          dynamicTemplateData: {
            name: "Ben Smith",
          },
        },
      ],
    });

    session = await Session.findOne({ class: classDoc._id, startTime });
    expect(session.toObject()).toMatchObject({
      class: classDoc._id,
      tutors: ["1"],
      tutees: ["2"],
      location: {
        address:
          "Upper Riccarton, Upper Riccarton, Christchurch 8041, New Zealand",
        coords: { lat: -43.5319765, lng: 172.57373 },
      },
      startTime,
      endTime: new Date(1687921200000),
      length: 60,
    });

    tutee = await User.findById(tutee._id);
    tutor = await User.findById(tutor._id);
    expect(tutee.sessions).toContain(session._id);
    expect(tutor.sessions).toContain(session._id);
    chat = await Chat.findById(classDoc.chat);
    expect(chat.messages[0].type).toBe("NEW_SESSION");
    expect(tutor.inbox[0].type).toBe("NEW_SESSION");
  });

  test("Delete session", async () => {
    await resolvers.Mutation.deleteSession(
      null,
      { id: session._id },
      { user: tutor }
    );
    classDoc = await Class.findById(classDoc._id);
    const res = await Session.findById(session._id);
    expect(res).toBeNull();
    expect(classDoc.sessions.toObject()).not.toContain(session._id);
    tutor = await User.findById(tutor._id);
    tutee = await User.findById(tutee._id);
    expect(tutor.sessions.toObject()).not.toContain(session._id);
    expect(tutee.sessions.toObject()).not.toContain(session._id);
  });
});

describe("Session user mutations", () => {
  beforeEach(async () => {
    session = await Session.create({
      _id: "1",
      location: {
        coords: { lat: -43.5319765, lng: 172.57373 },
        address:
          "Upper Riccarton, Upper Riccarton, Christchurch 8041, New Zealand",
      },
      tutors: ["1"],
      tutees: ["2"],
      class: "1",
      userResponses: [{ user: "2", response: "CONFIRM" }],
      startTime: new Date("2020-10-15T05:00:00.000Z"),
      endTime: new Date("2020-10-15T06:00:00.000Z"),
      length: 60,
    });
  });

  afterEach(async () => {
    await Session.findByIdAndRemove(session._id);
  });

  test("Session confirmation by everyone", async () => {
    classDoc.preferences.studentAgreeSessions = true;
    await classDoc.save();
    expect(session.status).toBe("UNCONFIRM");
    await resolvers.Mutation.confirmSession(
      null,
      { id: session._id },
      { user: tutor }
    );
    session = await Session.findById(session._id);
    expect(session.status).toBe("CONFIRM");
  });

  test("Session rejected by someone", async () => {
    expect(session.status).toBe("UNCONFIRM");
    await resolvers.Mutation.rejectSession(
      null,
      { id: session._id },
      { user: tutor }
    );
    session = await Session.findById(session._id);
    expect(session.status).toBe("REJECT");
  });

  test("Update session", async () => {
    const updates = {
      id: session._id,
      attendance: [{ tutee: "2", attended: true }],
      notes: "LOL notes",
    };
    await resolvers.Mutation.updateSession(null, updates, { user: tutor });
    delete updates.id;
    session = await Session.findById(session._id);
    expect(session.toObject()).toMatchObject(updates);
  });
});

describe("Chat tests", () => {
  test("Fetch chats as tutee", async () => {
    const info = await chatResolvers.Query.getChat(
      null,
      { channel: classDoc.chat },
      { user: tutee }
    );
    expect(info.toObject()).toMatchObject({
      _id: "1",
      bindToClass: true,
      class: { _id: "1" },
      users: expect.arrayContaining(["1", "2"]),
    });
  });
});
