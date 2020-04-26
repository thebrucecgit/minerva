import userSchema from "./modules/user/schema";
import { gql } from "apollo-server";

const rootSchema = gql`
  type Query
  type Mutation
`;

export default [rootSchema, userSchema];
