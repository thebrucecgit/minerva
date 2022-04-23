import Session from "../model";
import { ApolloError } from "apollo-server";

import {
  assertGroupAuthorization,
  assertTutor,
} from "../../../helpers/permissions";

export default async function deleteSession(_, { id }, { user }) {
  const session = await Session.findById(id);
  if (!session) throw new ApolloError("Session not found", 404);

  assertGroupAuthorization(user, session.users);
  assertTutor(user);

  await session.remove();
}
