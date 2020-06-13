import jwt from "jsonwebtoken";
import User from "./modules/user/models/user.model";

const { JWT_SECRET } = process.env;

export default async function (token) {
  const { id } = jwt.verify(token, JWT_SECRET);
  return await User.findById(id);
}
