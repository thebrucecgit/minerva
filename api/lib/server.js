import {} from "dotenv/config";
// const res = dotenv.config(__dirname + "/../.env");
// console.log(res);
import express from "express";
import { ApolloServer } from "apollo-server-express";
import cors from "cors";
import jwt from "jsonwebtoken";
import "./config/database";

import User from "./modules/user/models/user.model";

import schemas from "./schemas";
import resolvers from "./resolvers";

const { DOMAIN, JWT_SECRET } = process.env;

const server = new ApolloServer({
  typeDefs: schemas,
  resolvers,
  context: async ({ req }) => {
    const token = req.header("authorization");
    if (!token) return;
    const { _id } = await jwt.verify(token, JWT_SECRET);
    return await User.findById(_id);
  },
});

const app = express();
app.use(cors());
server.applyMiddleware({ app });

app.listen({ port: 5000 }, () => {
  console.log(`🚀  Server ready at ${DOMAIN}${server.graphqlPath}`);
});
