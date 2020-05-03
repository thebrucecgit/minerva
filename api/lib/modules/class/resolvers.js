import Class from "./models/class.model";

export default {
  Query: {
    async getClass(_, { id }, { user }) {
      // Authorisation
      return await Class.findById(id);
    },
    async getClasses(_, __, { user }) {
      await user.populate("classes").execPopulate();
      return user.classes;
    },
  },
  Class: {
    async sessions(classDoc) {
      await classDoc.populate("sessions").execPopulate();
      return classDoc.sessions;
    },
    async tutees(classDoc) {
      await classDoc.populate("tutees").execPopulate();
      return classDoc.tutees;
    },
    async tutors(classDoc) {
      await classDoc.populate("tutors").execPopulate();
      return classDoc.tutors;
    },
  },
  Mutation: {
    async updateClass(_, args, { user }) {
      return await Class.findByIdAndUpdate(args.id, args, {
        new: true,
        upsert: true,
        setDefaultsOnInsert: true,
      });
    },
  },
};
