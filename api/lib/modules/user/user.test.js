import {} from "dotenv/config";
import { MongoMemoryServer } from "mongodb-memory-server";
import User from "./model";
import * as db from "../../config/database";
import register from "./mutations/register";
import confirmUserEmail from "./mutations/confirmUserEmail";
import updatePassword from "./mutations/updatePassword";
import resetPassword from "./mutations/resetPassword";
import updateUser from "./mutations/updateUser";
import login from "./queries/login";
import sgMail from "@sendgrid/mail";
import ID from "../../types/ID";
import index, { docToRecord } from "../../config/search";

jest.mock("@sendgrid/mail");
sgMail.send.mockResolvedValue();

let mongod;

beforeAll(async () => {
  mongod = new MongoMemoryServer();
  await db.connect(await mongod.getUri());
});

afterAll(async () => {
  await db.disconnect();
  await mongod.stop();
});

function testJwtObj(jwtObj, desired) {
  expect(jwtObj.jwt).toMatch(
    /^[A-Za-z0-9-_=]+\.[A-Za-z0-9-_=]+\.?[A-Za-z0-9-_.+/=]*$/
  );
  expect(jwtObj.user).toMatchObject(desired);
  expect(jwtObj.exp).toBeGreaterThan(Date.now() / 1000 + 23 * 60 * 60);
}

const info = {
  name: "John Smith",
  email: "JOHN@example.com",
  password: "John123John",
  pfp: {
    type: "CLOUDINARY",
    url: "https://images.unsplash.com/photo-1601699165292-b3b1acd6472c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&h=250&q=80",
    cloudinaryPublicId:
      "Academe/karsten-winegeart-1MgX1KQcbj0-unsplash_ohlqzq.jpg",
  },
  yearGroup: "Year 12",
  school: "Christ's College",
  applyTutor: false,
  biography: "I'm an interested mammal",
};

const result = {
  name: "John Smith",
  email: "john@example.com",
  pfp: {
    type: "CLOUDINARY",
    url: "https://images.unsplash.com/photo-1601699165292-b3b1acd6472c?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=250&h=250&q=80",
    cloudinaryPublicId:
      "Academe/karsten-winegeart-1MgX1KQcbj0-unsplash_ohlqzq.jpg",
  },
  yearGroup: "Year 12",
  school: "Christ's College",
  biography: "I'm an interested mammal",
};

describe("Registering a new user via email", () => {
  afterAll(async () => {
    await User.deleteMany({});
  });

  test("Register new user", async () => {
    const jwtObj = await register(null, info);

    expect(sgMail.send.mock.calls[0][0]).toMatchObject({
      to: {
        email: "john@example.com",
        name: "John Smith",
      },
      from: {
        email: "confirmation@academe.co.nz",
        name: "Academe Email Confirmation",
      },
      reply_to: {
        email: "admin@academe.co.nz",
        name: "Admin",
      },
      templateId: "d-6327717732fb4b17bd19727a75a9e5cf",
      dynamic_template_data: {
        name: "John Smith",
        confirmLink: /\/auth\/confirm/,
      },
    });

    const docs = await User.find({ email: "john@example.com" });
    expect(docs).toHaveLength(1);
    expect(docs[0].password).not.toBe(info.password);

    testJwtObj(jwtObj, result);
    expect(docs[0].toObject()).toMatchObject(result);
  });

  test("Verify email of new user", async () => {
    const user = await User.findOne({ email: "john@example.com" });
    const jwtObj = await confirmUserEmail(null, {
      emailConfirmId: user.emailConfirmId,
    });
    testJwtObj(jwtObj, result);
    const final = await User.findOne({ email: "john@example.com" });
    expect(final.registrationStatus).toBe("COMPLETE");
  });

  test("Successful login", async () => {
    const jwtObj = await login(null, {
      email: "john@example.com",
      password: "John123John",
    });
    testJwtObj(jwtObj, result);
  });

  test("Unsuccessful login due to incorrect password", async () => {
    let err;
    try {
      await login(null, {
        email: "john@example.com",
        password: "123",
      });
    } catch (e) {
      err = e;
    }
    expect(err.message).toMatch(/password is incorrect/);
  });

  test("Updating user password while already logged in", async () => {
    const initial = await User.findOne({ email: "john@example.com" });
    const oldPassword = initial.password;
    const jwtObj = await updatePassword(
      null,
      { newPassword: "John342John" },
      { user: initial }
    );
    testJwtObj(jwtObj, result);
    const final = await User.findOne({ email: "john@example.com" });
    expect(oldPassword).not.toBe(final.password);
  });

  test("Resetting passwords", async () => {
    await resetPassword(null, { email: "john@example.com" });

    expect(sgMail.send.mock.calls[1][0]).toMatchObject({
      to: {
        email: "john@example.com",
        name: "John Smith",
      },
      from: {
        email: "passwordreset@academe.co.nz",
        name: "Academe Password Reset",
      },
      reply_to: {
        email: "admin@academe.co.nz",
        name: "Admin",
      },
      templateId: "d-02ecc5c486f14da1957ce5e6422cfb9a",
      dynamic_template_data: {
        name: "John Smith",
        resetCode: expect.any(Number),
      },
    });

    const { passwordResetCode, password: oldPassword } = await User.findOne({
      email: "john@example.com",
    });
    const jwtObj = await updatePassword(
      null,
      {
        email: "john@example.com",
        passwordResetCode,
        newPassword: "Joanna123",
      },
      {}
    );
    testJwtObj(jwtObj, result);
    const final = await User.findOne({ email: "john@example.com" });
    expect(oldPassword).not.toBe(final.password);
  });
});

jest.mock("../../config/search");
index.partialUpdateObject.mockResolvedValue();

describe("Update user details", () => {
  afterEach(async () => {
    docToRecord.mockClear();
    await User.deleteMany({});
  });
  test("Unauthorized update", async () => {
    await User.create({
      _id: "1",
      name: "John Smith",
      biography: "I'm an interested mammal",
    });
    let err;
    try {
      await updateUser(
        null,
        { id: "1", name: "John" },
        { user: { _id: new ID("2") } }
      );
    } catch (e) {
      err = e;
    }
    expect(err.message.toLowerCase()).toMatch(/unauthorized/);
    const user = await User.findById("1");
    expect(user.name).toBe("John Smith");
  });
  test("Update tutee name", async () => {
    await User.create({
      _id: "1",
      name: "John Smith",
      biography: "I'm an interested mammal",
    });
    await updateUser(
      null,
      { id: "1", name: "Sienna Johnson" },
      { user: { _id: new ID("1") } }
    );
    const user = await User.findById("1");
    expect(user.name).toBe("Sienna Johnson");
    expect(index.partialUpdateObject.mock.calls.length).toBe(0);
  });
  test("Update bio of approved tutor", async () => {
    await User.create({
      _id: "1",
      name: "John Smith",
      biography: "I'm an interested mammal",
      "tutor.status": "COMPLETE",
      "tutor.academicsTutoring": ["English", "Mathematics"],
    });
    await updateUser(
      null,
      {
        id: "1",
        biography: "I am available for tutoring on certain days.",
      },
      { user: { _id: new ID("1") } }
    );
    const user = await User.findById("1");
    expect(user.biography).toBe("I am available for tutoring on certain days.");
    expect(docToRecord.mock.calls[0][0]).toMatchObject({
      _id: "1",
      name: "John Smith",
      biography: "I am available for tutoring on certain days.",
      tutor: {
        academicsTutoring: ["English", "Mathematics"],
      },
    });
  });
});
