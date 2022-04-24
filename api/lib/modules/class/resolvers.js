import { nanoid } from "nanoid";
import Class from "./model";
import Session from "../session/model";
import User from "../user/model";
import Chat from "../chat/model";
import { ApolloError } from "apollo-server";

import axios from "axios";

import {
  assertGroupAuthorization,
  assertTutor,
  assertUser,
} from "../../helpers/permissions";

export default {
  Query: {
    async getClass(_, { id }, { user }) {
      const classData = await Class.findById(id);

      if (!classData.preferences.publicClass)
        assertGroupAuthorization(user, classData.users);

      return classData;
    },
    async getClassesOfUser(_, { userID, limit = 10 }, { user }) {
      const targetUser = await User.findById(userID);
      assertUser(user, targetUser);

      return await Class.find(
        {
          $or: [{ tutees: userID }, { tutors: userID }],
        },
        null,
        { limit }
      );
    },
    async getPublicClasses(_, { limit = 6 }) {
      return await Class.find({ "preferences.publicClass": true }, null, {
        limit,
      }).lean();
    },
  },
  Class: {
    async sessions(classDoc, { time = new Date(), old = false, limit = 10 }) {
      await classDoc.populate({
        path: "sessions",
        match: {
          endTime: { [old ? "$lte" : "$gt"]: time },
        },
        limit,
        options: {
          sort: { startTime: old ? -1 : 1 },
        },
      });

      return classDoc.sessions;
    },
    async tutees(classDoc) {
      await classDoc.populate("tutees");
      return classDoc.tutees;
    },
    async tutors(classDoc) {
      await classDoc.populate("tutors");
      return classDoc.tutors;
    },
    async chat(classDoc) {
      await classDoc.populate("chat");
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

      return newClass;
    },
    async joinClass(_, { id }, { user }) {
      const classInfo = await Class.findById(id, "preferences.publicClass");
      if (!classInfo.preferences.publicClass)
        throw new ApolloError("Class not public", 403);

      const newInfo = await Class.findByIdAndUpdate(
        id,
        {
          $addToSet: { tutees: user._id },
        },
        { new: true }
      );
      return newInfo;
    },
    async updateClass(_, args, { user }) {
      assertTutor(user);

      const oldClassInfo = await Class.findById(args.id);
      if (!oldClassInfo) throw new Error("Class not found", 404);

      assertGroupAuthorization(user, oldClassInfo.users);

      const edits = { ...args };

      const sessionUpdates = [];

      // Video call updates
      if (Object.prototype.hasOwnProperty.call(args.preferences, "online")) {
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

        if (args.preferences.online && !oldClassInfo.videoLink) {
          const { data } = await axios({
            method: "post",
            url: "https://api.join.skype.com/v1/meetnow/createjoinlinkguest",
            data: {
              title: oldClassInfo.name,
            },
          });

          edits.videoLink = data.joinLink;
        }
      }

      // Chat enabling updates
      if (
        Object.prototype.hasOwnProperty.call(args.preferences, "enableChat")
      ) {
        if (args.preferences.enableChat) {
          if (!oldClassInfo.chat) {
            const { channel } = await Chat.create({
              bindToClass: true,
              class: oldClassInfo._id,
              users: [...oldClassInfo.tutors, ...oldClassInfo.tutees],
            });
            edits.chat = channel;
          }
        } else {
          // Remove chat
          await Chat.deleteOne({ class: oldClassInfo._id });
          edits.chat = undefined;
        }
      }

      const reqs = []; // A whole bunch of requests simultaneously
      reqs.push(
        await Class.findByIdAndUpdate(args.id, edits, {
          new: true,
        })
      );

      if (args.tutees) {
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
      if (args.tutors) {
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
      if (sessionUpdates.length > 0) {
        reqs.push(Session.bulkWrite(sessionUpdates));
        if (
          args.preferences?.enableChat ??
          oldClassInfo.preferences.enableChat
        ) {
          reqs.push(
            Chat.findByIdAndUpdate(oldClassInfo.chat, {
              users: [
                ...(args.tutors ?? oldClassInfo.tutors),
                ...(args.tutees ?? oldClassInfo.tutees),
              ],
            })
          );
        }
      }

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

      const isTutor = classData.tutors.some((tutor) =>
        tutor._id.isEqual(user._id)
      );

      if (isTutor && classData.tutors.length === 1)
        throw new Error(
          "Cannot leave class without any tutors. Delete class instead?"
        );

      const userType = isTutor ? "tutors" : "tutees";
      await Class.findByIdAndUpdate(id, { $pull: { [userType]: user._id } });
    },
  },
};
