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
    name: "Ben Smith",
    email: "ben@example.com",
    pfp: {
      type: "URL",
      url: "https://images.unsplash.com/photo-1601699165292-b3b1acd6472c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&h=250&q=80",
    },
    tutor: {
      status: "COMPLETE",
      academicsTutoring: ["Geography", "Mathematics"],
    },
    yearGroup: "Year 12",
    school: "Christ's College",
    biography: "You never know.",
    sessions: ["1"],
  });

  tutee = await User.create({
    _id: "2",
    name: "John Smith",
    email: "john@example.com",
    pfp: {
      type: "URL",
      url: "https://images.unsplash.com/photo-1601699165292-b3b1acd6472c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&h=250&q=80",
    },
    yearGroup: "Year 13",
    school: "Christ's College",
    biography: "You always know.",
    sessions: ["1"],
  });
});

afterAll(async () => {
  await db.disconnect();
  await mongod.stop();
});

// describe("Creation and deletion", () => {
//   test("Unauthorized instantiate session", async () => {
//     classDoc.preferences.studentInstantiation = false;
//     await classDoc.save();
//     let err;
//     try {
//       const startTime = new Date(1687917600000); // Wednesday, June 28, 2023 at 2:00:00 PM GMT+12
//       await resolvers.Mutation.instantiateSession(
//         null,
//         {
//           classId: classDoc._id,
//           startTime,
//           length: 60,
//         },
//         { user: tutee }
//       );
//     } catch (e) {
//       err = e;
//     }
//     expect(err.message).toMatch(/unauthorized/);
//   });

//   test("Authorized instantiate session", async () => {
//     sgMail.send.mockResolvedValue();

//     classDoc.preferences.studentInstantiation = true;
//     classDoc.preferences.studentAgreeSession = false;
//     await classDoc.save();
//     const startTime = new Date(1687917600000); // Wednesday, June 28, 2023 at 2:00:00 PM GMT+12
//     await resolvers.Mutation.instantiateSession(
//       null,
//       {
//         classId: classDoc._id,
//         startTime,
//         length: 60,
//       },
//       { user: tutee }
//     );

//     expect(sgMail.send.mock.calls[0][0]).toMatchObject({
//       dynamicTemplateData: {
//         request: false,
//         user: "John Smith",
//         className: "Sunday Afternoon Maths",
//         sessionTime: "Wednesday, June 28, 2023 at 2:00:00 PM GMT+12",
//         // sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
//       },
//       from: "no-reply@academe.co.nz",
//       reply_to: {
//         email: "admin@academe.co.nz",
//         name: "Admin",
//       },
//       templateId: "d-f02579026cf84c5194f7135d838e87ad",
//       subject: `New Session for "Sunday Afternoon Maths"`,
//       personalizations: [
//         {
//           to: {
//             email: "ben@example.com",
//             name: "Ben Smith",
//           },
//           dynamicTemplateData: {
//             name: "Ben Smith",
//           },
//         },
//       ],
//     });

//     session = await Session.findOne({ class: classDoc._id, startTime });
//     expect(session.toObject()).toMatchObject({
//       class: classDoc._id,
//       tutors: ["1"],
//       tutees: ["2"],
//       location: {
//         address:
//           "Upper Riccarton, Upper Riccarton, Christchurch 8041, New Zealand",
//         coords: { lat: -43.5319765, lng: 172.57373 },
//       },
//       startTime,
//       endTime: new Date(1687921200000),
//       length: 60,
//     });

//     chat = await Chat.findById(classDoc.chat);
//     expect(chat.messages[chat.messages.length - 1].type).toBe("NEW_SESSION");
//     tutor = await User.findById(tutor._id);
//     expect(tutor.inbox[tutor.inbox.length - 1].type).toBe("NEW_SESSION");
//   });

//   test("Retrieving sessions", async () => {
//     const res = await resolvers.Query.getSessionsOfUser(
//       null,
//       { userID: tutee._id },
//       { user: tutee }
//     );
//     expect(res).toContainEqual(
//       expect.objectContaining({
//         _id: session._id,
//       })
//     );
//   });

//   test("Delete session", async () => {
//     await resolvers.Mutation.deleteSession(
//       null,
//       { id: session._id },
//       { user: tutor }
//     );
//     classDoc = await Class.findById(classDoc._id);
//     const res = await Session.findById(session._id);
//     expect(res).toBeNull();
//     expect(classDoc.sessions.toObject()).not.toContain(session._id);
//     tutor = await User.findById(tutor._id);
//     tutee = await User.findById(tutee._id);
//     expect(tutor.sessions.toObject()).not.toContain(session._id);
//     expect(tutee.sessions.toObject()).not.toContain(session._id);
//   });
// });

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
