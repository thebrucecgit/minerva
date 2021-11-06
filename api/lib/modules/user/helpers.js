import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import { client as algoliaClient } from "../../config/search";

const { JWT_SECRET, ALGOLIA_SEARCH_API } = process.env;

const oauth = new OAuth2Client();

export async function verifyGoogleToken(idToken) {
  const ticket = await oauth.verifyIdToken({ idToken });
  return ticket.getPayload();
}

export function escapeRegExp(string) {
  return string.replace(/[.*+\-?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

export function createUserObject(user) {
  return {
    jwt: jwt.sign({ id: user._id }, JWT_SECRET, {
      expiresIn: "1d",
    }),
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 24, // 1 day
    algoliaKey: algoliaClient.generateSecuredApiKey(ALGOLIA_SEARCH_API, {
      filters: `school:"${user.school}"`,
      userToken: user._id,
    }),
    user: user.toObject(),
  };
}
