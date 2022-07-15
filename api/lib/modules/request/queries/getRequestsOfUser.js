import User from "../../user/model";
import { assertUser } from "../../../helpers/permissions";
import TutorRequest from "../model";

export default async function getRequestsOfUser(
  _,
  { userID, limit = 10 },
  { user }
) {
  const targetUser = await User.findById(userID);
  assertUser(user, targetUser);

  return await TutorRequest.find({ requester: userID })
    .limit(limit)
    .sort({ date: -1 });
}
