import {} from "dotenv/config";
import express from "express";
import cors from "cors";
import http from "http";

import { connect } from "./config/database";

import * as websocket from "./websocket";
import apolloServer from "./apollo";

import { indexAll } from "./config/search";

const { DOMAIN, PORT, NODE_ENV } = process.env;

if (NODE_ENV === "production") indexAll();

connect();

const app = express();
app.use(cors());

app.get("/", (req, res) => res.send("You have reached Academe servers."));

apolloServer.applyMiddleware({ app });

const server = http.createServer(app);

websocket.init(server);

server.listen(PORT ?? 5000, () => {
  console.log(`🚀  Server ready at ${DOMAIN}${apolloServer.graphqlPath}`);
});
