import jwt from "jsonwebtoken";
import User from "./modules/user/model";

const { JWT_SECRET } = process.env;

export default async function (token) {
  try {
    const { id } = jwt.verify(token, JWT_SECRET);
    return await User.findById(id);
  } catch (e) {
    return null;
  }
}
