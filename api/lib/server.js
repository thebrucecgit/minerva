import {} from "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";

import { connect } from "./config/database";

import * as websocket from "./websocket";
import apolloServer from "./apollo";

import { setSettings } from "./config/search";

const { FRONTEND_DOMAIN, DOMAIN, PORT, NODE_ENV } = process.env;

async function startServer() {
  // Connect to DB
  await connect();
  await setSettings();

  const app = express();
  app.use(cors({ origin: FRONTEND_DOMAIN }));

  app.get("/", (req, res) => res.send("You have reached Minerva servers."));

  const httpServer = http.createServer(app);
  websocket.init(httpServer);

  const server = apolloServer(httpServer);
  await server.start();
  server.applyMiddleware({ app });

  await new Promise((resolve) => httpServer.listen(PORT ?? 5000, resolve));
  console.log(
    `🚀  Server ready at ${DOMAIN}${server.graphqlPath} on port ${PORT ?? 5000}`
  );
}

startServer();
