import { ApolloServer } from "apollo-server-express";
import { ApolloServerPluginDrainHttpServer } from "apollo-server-core";
import authenticate from "./authenticate";
import schemas from "./schemas";
import resolvers from "./resolvers";

export default (httpServer) =>
  new ApolloServer({
    typeDefs: schemas,
    resolvers,
    context: async ({ req }) => {
      const authHeader = req.header("authorization");
      if (!authHeader) return;
      const token = authHeader.split(" ")[1];
      const user = await authenticate(token);
      return { user };
    },
    plugins: [ApolloServerPluginDrainHttpServer({ httpServer })],
  });
