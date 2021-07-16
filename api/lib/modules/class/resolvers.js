import { nanoid } from "nanoid";
import Class from "./model";
import User from "../user/model";
import Session from "../session/model";
import Chat from "../chat/model";

import axios from "axios";
import Chat from "../chat/model";

import {
  assertGroupAuthorization,
  assertTutor,
} from "../../helpers/permissions";

export default {
  Query: {
    async getClass(_, { id }, { user }) {
      const classData = await Class.findById(id);

      assertGroupAuthorization(user, classData.users);

      return classData;
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
    async chat(classDoc) {
      await classDoc.populate("chat").execPopulate();
      return classDoc.chat;
    },
  },
  Mutation: {
    async createClass(_, { name }, { user }) {
      assertTutor(user);

      const classID = nanoid(11);

      // Creates chat by default
      const { channel } = await Chat.create({
        bindToClass: true,
        class: classID,
      });

      // Create class and link to chat
      const newClass = await Class.create({
        _id: classID,
        name,
        tutors: [user._id],
        chat: channel,
      });

      // Add class to user's class
      await User.findOneAndUpdate(
        { _id: user._id, userType: user.userType },
        {
          $addToSet: { classes: newClass._id },
        }
      );

      return newClass;
    },
    async updateClass(_, args, { user }) {
      assertTutor(user);

      const oldClassInfo = await Class.findById(args.id);
      if (!oldClassInfo) throw new Error("Class not found", 404);

      assertGroupAuthorization(user, oldClassInfo.users);

      const edits = { ...args };

      const { tutors, tutees, videoLink, name } = oldClassInfo;

      const userUpdates = [];
      const sessionUpdates = [];

      // Video call updates
      if (args.preferences?.hasOwnProperty("online")) {
        sessionUpdates.push({
          updateMany: {
            filter: {
              _id: { $in: oldClassInfo.sessions },
              endTime: { $gt: new Date() },
            },
            update: {
              "settings.online": args.preferences.online,
            },
          },
        });

        if (args.preferences.online && !videoLink) {
          const { data } = await axios({
            method: "post",
            url: "https://api.join.skype.com/v1/meetnow/createjoinlinkguest",
            data: {
              title: name,
            },
          });

          edits.videoLink = data.joinLink;
        }
      }

      // Chat enabling updates
      if (args.preferences?.hasOwnProperty("enableChat")) {
        if (args.preferences.enableChat) {
          if (!oldClassInfo.chat) {
            const { channel } = await Chat.create({
              bindToClass: true,
              class: oldClassInfo._id,
            });
            edits.chat = channel;
          }
        } else {
          // Remove chat
          await Chat.deleteOne({ class: oldClassInfo._id });
          edits.chat = undefined;
        }
      }

      const reqs = [
        Class.findByIdAndUpdate(args.id, edits, {
          new: true,
        }),
      ];

      // Syncing with tutors updates
      if (args.tutors) {
        // Tutors that have been deleted
        const deletedTutors = tutors.filter((id) => !args.tutors.includes(id));
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
        // TODO: figure out a better way
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

      // Sync with tutees updates
      if (args.tutees) {
        const deletedTutees = tutees.filter((id) => !args.tutees.includes(id));
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

      const [classInfo] = await Promise.all(reqs);
      return classInfo;
    },
    async deleteClass(_, { id }, { user }) {
      assertTutor(user);
      const classInfo = await Class.findById(id);
      if (!classInfo) throw new Error("Class not found", 404);
      assertGroupAuthorization(user, classInfo.users);

      await classInfo.remove();
    },
    async leaveClass(_, { id }, { user }) {
      const classData = await Class.findById(id);
      assertGroupAuthorization(user, classData.users);

      if (user.userType === "TUTOR" && classData.tutors.length === 1)
        throw new Error(
          "Cannot leave class without any tutors. Delete class instead?"
        );

      const userType = user.userType === "TUTOR" ? "tutors" : "tutees";
      await Class.findByIdAndUpdate(id, { $pull: { [userType]: user._id } });

      const updated = await User.findByIdAndUpdate(user._id, {
        $pull: { classes: id },
        $pullAll: { sessions: classData.sessions },
      });
    },
  },
};
