import { indexAll } from "../../../config/search";
import { assertAdmin } from "../../../helpers/permissions";

export default async function indexTutors(_, _, user) {
  assertAdmin(user);
  await indexAll();
}
