import TutorRequest from "../model";
import { assertAuthenticated } from "../../../helpers/permissions";

export default async function reviewUser(
  _,
  { subject, curriculum, other },
  { user }
) {
  assertAuthenticated(user);
  return await TutorRequest.create({
    requester: user._id,
    subject,
    curriculum,
    other,
    status: "PENDING",
  });
}
