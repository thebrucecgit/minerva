import Session from "../model";
import { assertAuthenticated } from "../../../helpers/permissions";
import { UserInputError } from "apollo-server";

export default async function reviewSession(_, { id, review }, { user }) {
  const session = await Session.findById(id);
  assertAuthenticated(user);

  const isTutor = session.tutors.some((t) => t._id.isEqual(user._id));

  if (
    (!isTutor && session.tuteeReviews.some((r) => r.user.isEqual(user._id))) ||
    (isTutor && session.tutorReviews.some((r) => r.user.isEqual(user._id)))
  )
    throw new UserInputError("You can't review more than once");

  return await Session.findByIdAndUpdate(
    id,
    {
      $push: {
        [isTutor ? "tutorReviews" : "tuteeReviews"]: {
          ...review,
          user: user._id,
        },
      },
    },
    { new: true }
  );
}
