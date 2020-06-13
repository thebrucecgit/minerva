import {} from "dotenv/config";
// const res = dotenv.config(__dirname + "/../.env");
// console.log(res);
import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import "./config/database";

import chatRoutes from "./modules/chat/routes";

import authenticate from "./authenticate";
import schemas from "./schemas";
import resolvers from "./resolvers";

const { DOMAIN } = process.env;

const server = new ApolloServer({
  typeDefs: schemas,
  resolvers,
  context: async ({ req }) => {
    const authHeader = req.header("authorization");
    if (!authHeader) return;
    const token = authHeader.split(" ")[1];
    const user = await authenticate(token);
    return { user };
  },
});

const app = express();
app.use(cors());
app.use("/chat", chatRoutes);

server.applyMiddleware({ app });

app.listen({ port: 5000 }, () => {
  console.log(`🚀  Server ready at ${DOMAIN}${server.graphqlPath}`);
});
