import {} from "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as db from "../../config/database";
import Class from "./model";
import User from "../user/model";
import Session from "../session/model";
import resolvers from "./resolvers";
import axios from "axios";

let mongod, tutor, tutee;

jest.mock("axios");

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
    },
    yearGroup: 12,
    school: "Example4 High School",
    academicsLearning: [],
    extrasLearning: [],
    academicsTutoring: ["Geography", "Mathematics"],
    extrasTutoring: ["Piano"],
    biography: "You never know.",
    classes: ["1"],
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
    yearGroup: 13,
    school: "Example High School",
    academicsLearning: ["English", "Mathematics"],
    extrasLearning: ["Coding"],
    academicsTutoring: [],
    extrasTutoring: [],
    biography: "You always know.",
    classes: ["1"],
    sessions: ["1"],
  });
});

afterAll(async () => {
  await db.disconnect();
  await mongod.stop();
});

describe("Tutor operations", () => {
  let classId;

  test("Tutor create class", async () => {
    await resolvers.Mutation.createClass(
      null,
      { name: "Genuine Afternoon Session" },
      { user: tutor }
    );

    const res = await Class.find({ name: "Genuine Afternoon Session" });
    expect(res.length).toBeGreaterThan(0);
    classId = res[0]._id;
    expect(res[0].tutors.some((t) => t._id.isEqual(tutor._id))).toBeTruthy();
  });

  test("Updates class name", async () => {
    await resolvers.Mutation.updateClass(
      null,
      {
        id: classId,
        name: "Ingenuine Afternoon Session",
      },
      { user: tutor }
    );
    const doc = await Class.findById(classId);
    expect(doc.name).toBe("Ingenuine Afternoon Session");
  });

  test("Updates class details", async () => {
    let session = await Session.create({
      _id: "1",
      location: {
        coords: { lat: -43.5319765, lng: 172.57373 },
        address:
          "Upper Riccarton, Upper Riccarton, Christchurch 8041, New Zealand",
      },
      tutors: ["1"],
      tutees: [],
      class: "1",
      userResponses: [{ user: "2", response: "CONFIRM" }],
      startTime: new Date("2023-10-15T05:00:00.000Z"),
      endTime: new Date("2023-10-15T06:00:00.000Z"),
      length: 60,
    });
    await Class.findByIdAndUpdate(classId, { $push: { sessions: "1" } });

    const updates = {
      id: classId,
      tutees: [tutee._id],
      description: "A class that is built for ingenuity.",
      location: {
        address:
          "Upper Riccarton, Upper Riccarton, Christchurch 8041, New Zealand",
        coords: {
          lat: -43.5319765,
          lng: 172.57373,
        },
      },
      tags: ["Mathematics"],
      image:
        "https://images.unsplash.com/photo-1494587416117-f102a2ac0a8d?ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&ixlib=rb-1.2.1&auto=format&fit=crop&w=2700&q=80",
    };
    await resolvers.Mutation.updateClass(null, updates, { user: tutor });

    const doc = await Class.findById(classId);
    delete updates.id;
    updates._id = classId;
    expect(doc.toObject()).toMatchObject(updates);
    session = await Session.findById(session._id);
    expect(session.tutees.length).toBe(doc.tutees.length);
    expect(session.tutees.some((t) => t._id.isEqual("2"))).toBeTruthy();
  });

  test("Change class to be online", async () => {
    axios.mockResolvedValue({
      data: { joinLink: "https://join.skype.com/WmG7eDM28MQF" },
    });

    await resolvers.Mutation.updateClass(
      null,
      {
        id: classId,
        preferences: { online: true },
      },
      { user: tutor }
    );

    expect(axios.mock.calls[0][0]).toMatchObject({
      method: "post",
      url: "https://api.join.skype.com/v1/meetnow/createjoinlinkguest",
      data: {
        title: "Ingenuine Afternoon Session",
      },
    });

    const doc = await Class.findById(classId);
    expect(doc.preferences.online).toBeTruthy();
    expect(doc.videoLink).toBeDefined();
  });

  test("Delete class", async () => {
    await resolvers.Mutation.deleteClass(
      null,
      { id: classId },
      { user: tutor }
    );
    const res = await Class.findById(classId);
    expect(res).toBeNull();
  });
});

describe("Tutee operations", () => {
  const details = {
    _id: "1",
    tags: ["Mathematics", "English"],
    date: "Saturdays, 4pm",
    image:
      "https://images.unsplash.com/photo-1543165796-5426273eaab3?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=1950&q=80",
    sessions: ["1"],
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
    chat: "DAP4kLYvYZ1",
  };

  beforeAll(async () => {
    await Class.create(details);
  });

  test("Get class details", async () => {
    const info = await resolvers.Query.getClass(
      null,
      { id: 1 },
      { user: tutee }
    );

    expect(info.toObject()).toMatchObject(details);
  });

  test("Unsuccessfully edit class details", async () => {
    let err;
    try {
      await resolvers.Mutation.updateClass(
        null,
        { tutees: 3 },
        { user: tutee }
      );
    } catch (e) {
      err = e;
    }
    expect(err.message).toMatch(/unauthorized/);
  });
});
