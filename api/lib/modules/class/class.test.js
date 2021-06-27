import {} from "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import * as db from "../../config/database";
import Class from "./model";
import User from "../user/model";
import resolvers from "./resolvers";

let mongod, tutor, tutee;

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
    classes: [],
    sessions: [],
    // grades: "---",
  });

  tutee = await User.create({
    _id: 2,
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
    classes: [],
    sessions: [],
    // grades: "---",
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
    tutor = await User.findById(tutor._id).populate("classes");
    expect(tutor.classes.toObject()).toContainEqual(
      expect.objectContaining({
        _id: classId,
        name: "Genuine Afternoon Session",
      })
    );
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
    tutee = await User.findById(tutee._id).populate("classes");
    expect(tutee.classes.toObject()).toContainEqual(
      expect.objectContaining({
        _id: classId,
        name: "Ingenuine Afternoon Session",
      })
    );
  });

  test("Change class to be online", async () => {
    await resolvers.Mutation.updateClass(
      null,
      {
        id: classId,
        preferences: { online: true },
      },
      { user: tutor }
    );

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
    tutor = await User.findById(tutor._id).populate("classes");
    tutee = await User.findById(tutee._id).populate("classes");
    expect(tutor.classes).not.toContainEqual(
      expect.objectContaining({
        _id: classId,
      })
    );
    expect(tutee.classes).not.toContainEqual(
      expect.objectContaining({
        _id: classId,
      })
    );
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
