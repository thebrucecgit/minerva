import Class from "./models/class.model";
import User from "../user/models/user.model";
import Session from "../session/models/session.model";

export default {
  Query: {
    async getClass(_, { id }, { user }) {
      if (user.userType !== "TUTOR" && !user.classes.toObject().includes(id))
        throw Error("Not authorized", 401);
      return await Class.findById(id);
    },
    async getClasses(_, { limit }, { user }) {
      await user
        .populate({
          path: "classes",
          limit,
        })
        .execPopulate();
      return user.classes;
    },
  },
  Class: {
    async sessions(classDoc, { time = new Date(), old = false, limit = 10 }) {
      await classDoc
        .populate({
          path: "sessions",
          match: {
            endTime: { [old ? "$lte" : "$gt"]: time },
          },
          limit,
          options: {
            sort: { startTime: old ? -1 : 1 },
          },
        })
        .execPopulate();

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
      if (user.userType !== "TUTOR") throw Error("Not authorized", 401);

      const oldClassInfo = await Class.findById(args.id);
      const reqs = [
        Class.findByIdAndUpdate(args.id, args, {
          new: true,
          upsert: true,
          setDefaultsOnInsert: true,
        }),
      ];

      // TODO: What happens if document upsert
      if (oldClassInfo) {
        const { tutors, tutees } = oldClassInfo;

        const userUpdates = [];
        const sessionUpdates = [];

        if (args.tutors?.length) {
          // Tutors that have been deleted
          const deletedTutors = tutors.filter(
            (id) => !args.tutors.includes(id)
          );
          // Tutors that have been newly added
          const newTutors = args.tutors.filter((id) => !tutors.includes(id));

          userUpdates.push({
            updateMany: {
              filter: { _id: { $in: deletedTutors }, userType: "TUTOR" },
              update: { $pull: { classes: args.id } },
            },
          });

          userUpdates.push({
            updateMany: {
              filter: { _id: { $in: newTutors }, userType: "TUTOR" },
              update: { $addToSet: { classes: args.id } },
            },
          });

          // Sync tutors with upcoming sessions
          sessionUpdates.push({
            updateMany: {
              filter: {
                _id: { $in: oldClassInfo.sessions },
                endTime: { $gt: new Date() },
                "settings.syncTutorsWithClass": true,
              },
              update: {
                tutors: args.tutors,
              },
            },
          });
        }

        if (args.tutees?.length) {
          const deletedTutees = tutees.filter(
            (id) => !args.tutees.includes(id)
          );
          const newTutees = args.tutees.filter((id) => !tutees.includes(id));

          userUpdates.push({
            updateMany: {
              filter: { _id: { $in: deletedTutees }, userType: "TUTEE" },
              update: { $pull: { classes: args.id } },
            },
          });

          userUpdates.push({
            updateMany: {
              filter: { _id: { $in: newTutees }, userType: "TUTEE" },
              update: { $addToSet: { classes: args.id } },
            },
          });

          // Sync tutees with upcoming sessions
          sessionUpdates.push({
            updateMany: {
              filter: {
                _id: { $in: oldClassInfo.sessions },
                endTime: { $gt: new Date() },
                "settings.syncTuteesWithClass": true,
              },
              update: {
                tutees: args.tutees,
              },
            },
          });
        }

        if (userUpdates.length) reqs.push(User.bulkWrite(userUpdates));
        if (sessionUpdates.length) reqs.push(Session.bulkWrite(sessionUpdates));
      }

      const [classInfo] = await Promise.all(reqs);
      return classInfo;
    },
  },
};
