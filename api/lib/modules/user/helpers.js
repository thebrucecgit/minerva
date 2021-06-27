import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";

const { JWT_SECRET } = process.env;

const client = new OAuth2Client();

export async function verifyGoogleToken(idToken) {
  const ticket = await client.verifyIdToken({ idToken });
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
    user: user.toObject(),
  };
}
