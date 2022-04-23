import { GraphQLScalarType, Kind } from "graphql";
import userResolvers from "./modules/user/resolvers";
import sessionResolvers from "./modules/session/resolvers";
import classResolvers from "./modules/class/resolvers";
import chatResolvers from "./modules/chat/resolvers";
import fileResolvers from "./modules/file/resolvers";

const rootResolvers = {
  Date: new GraphQLScalarType({
    name: "Date",
    description: "A Date type",
    parseValue: (value) => new Date(value),
    serialize: (value) => value.getTime(),
    parseLiteral: (ast) => {
      ast.kind === Kind.INT ? parseInt(ast.value, 10) : null;
    },
  }),
};

export default [
  rootResolvers,
  userResolvers,
  sessionResolvers,
  classResolvers,
  chatResolvers,
  fileResolvers,
];
