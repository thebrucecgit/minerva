import { AuthenticationError, ApolloError } from "apollo-server";

// Asserts that user is logged in
export function assertAuthenticated(user) {
  if (user) return true;
  throw new AuthenticationError(
    "You are not logged in, or your login has expired. Try reloading."
  );
}

// Asserts that user him/herself or an admin
export function assertUser(reqUser, targetUser) {
  assertAuthenticated(reqUser);
  if (reqUser._id.isEqual(targetUser._id)) return true;
  throw new ApolloError("User unauthorized for this field", 401);
}

// Asserts that user is him/herself or a tutor or an admin
export function assertUserOrTutor(reqUser, targetUser) {
  assertAuthenticated(reqUser);
  if (
    reqUser._id.isEqual(targetUser._id) ||
    reqUser.tutor.status === "COMPLETE" ||
    targetUser.tutor.status === "COMPLETE"
  )
    return true;

  throw new ApolloError("User unauthorized for this field", 401);
}

// Asserts that the user is a tutor or an admin
export function assertTutor(user) {
  assertAuthenticated(user);
  if (user.tutor.status !== "COMPLETE")
    throw new ApolloError("User unauthorized for this field", 401);
  return true;
}

// Asserts that the user is an admin
export function assertAdmin(user) {
  assertAuthenticated(user);
  if (!user.admin.status)
    throw new ApolloError("User unauthorized for this field", 401);
  return true;
}

// Asserts that the user is someone in the class / session / chat or an admin
export function assertGroupAuthorization(user, users) {
  assertAuthenticated(user);
  if (!users.some((u) => u._id.isEqual(user._id)))
    throw new ApolloError("User unauthorized", 401);
  return true;
}
