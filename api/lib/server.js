import {} from "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";

import "./config/database";

import websocket from "./websocket";
import apolloServer from "./apollo";

const { DOMAIN } = process.env;

const app = express();
app.use(cors());

apolloServer.applyMiddleware({ app });

const server = http.createServer(app);

websocket.init(server);

server.listen(5000, () => {
  console.log(`🚀  Server ready at ${DOMAIN}${apolloServer.graphqlPath}`);
});
