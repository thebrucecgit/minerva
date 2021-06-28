import { AuthenticationError, ApolloError } from "apollo-server";

// Asserts that user is logged in
export function assertAuthenticated(user) {
  if (!user) {
    throw new AuthenticationError("You need to be logged in");
  }
  return true;
}

// Asserts that user him/herself or an admin
export function assertUser(reqUser, targetUser) {
  assertAuthenticated(reqUser);
  if (reqUser._id !== targetUser._id && reqUser.userType !== "ADMIN")
    throw new ApolloError("User unauthorized for this field", 401);
  return true;
}

// Asserts that user him/herself or a tutor or an admin
export function assertUserOrTutor(reqUser, targetUser) {
  assertAuthenticated(reqUser);
  if (reqUser._id !== targetUser._id && reqUser.userType === "TUTEE")
    throw new ApolloError("User unauthorized for this field", 401);
  return true;
}

// Asserts that the user is a tutor or an admin
export function assertTutor(user) {
  assertAuthenticated(user);
  if (user.userType !== "TUTOR" && user.userType !== "ADMIN")
    throw new ApolloError("User unauthorized for this field", 401);
  return true;
}

// Asserts that the user is an admin
export function assertAdmin(user) {
  assertAuthenticated(user);
  if (user.userType !== "ADMIN")
    throw new ApolloError("User unauthorized for this field", 401);
  return true;
}

// Asserts that the user is someone in the class / session / chat or an admin
export async function assertGroupAuthorization(user, users) {
  assertAuthenticated(user);
  if (!users.includes(user._id) && user.userType !== "ADMIN")
    throw new ApolloError("User unauthorized", 401);
  return true;
}

export function assertSessionInstantiation(user, doc) {
  assertGroupAuthorization(user, doc.users);

  // User must be a tutee with permissions
  if (user.userType === "TUTEE" && !doc.preferences.studentInstantiation)
    throw new ApolloError("User unauthorized to instantiate session", 401);

  return true;
}
