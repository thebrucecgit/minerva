import { gql } from "apollo-server";

import userSchema from "./modules/user/schema";
import classSchema from "./modules/class/schema";
import tutorRequestSchema from "./modules/request/schema";
import sessionSchema from "./modules/session/schema";
import chatSchema from "./modules/chat/schema";
import fileSchema from "./modules/file/schema";

const rootSchema = gql`
  type Query
  type Mutation

  scalar Date
`;

export default [
  rootSchema,
  userSchema,
  classSchema,
  tutorRequestSchema,
  sessionSchema,
  chatSchema,
  fileSchema,
];
