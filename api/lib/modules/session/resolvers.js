import Session from "./models/session.model";
import Class from "../class/models/class.model";

export default {
  Query: {
    async getSession(_, { id }, { user }) {
      // user authorisation
      return await Session.findById(id);
    },
    async getSessions(_, __, { user }) {
      await user.populate("sessions").execPopulate();
      return user.sessions;
    },
  },
  Session: {
    async class(session) {
      await session.populate("class").execPopulate();
      return session.class;
    },
    async tutors(session) {
      await session.populate("tutors").execPopulate();
      return session.tutors;
    },
  },
  Mutation: {
    async instantiateSession(_, { classId, time, length }, { user }) {
      const classDoc = await Class.findById(classId);
      const session = await Session.create({
        ...classDoc,
        tutors: classDoc.tutors,
        class: classId,
        time,
        length,
        attendance: classDoc.tutees.map((tutee) => ({ tutee })),
      });
      classDoc.sessions.push(session._id);
      await classDoc.save();
      return session;
    },
    async updateSession(_, args, { user }) {
      return await Session.findByIdAndUpdate(args.id, args, {
        new: true,
      });
    },
  },
};
