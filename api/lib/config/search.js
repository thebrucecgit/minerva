import algoliasearch from "algoliasearch";
import User from "../modules/user/model";
import * as yup from "yup";

const { ALGOLIA_APPID, ALGOLIA_ADMIN_API, ALGOLIA_INDEX } = process.env;

const client = algoliasearch(ALGOLIA_APPID, ALGOLIA_ADMIN_API);
const index = client.initIndex(ALGOLIA_INDEX);

const indexSchema = yup.object().shape({
  objectID: yup.string().required(),
  name: yup.string(),
  yearGroup: yup.number().integer(),
  school: yup.string(),
  biography: yup.string(),
  academics: yup.array().of(yup.string()),
  extras: yup.array().of(yup.string()),
  pfp: yup.object().shape({
    type: yup.string(),
    url: yup.string(),
    cloudinaryPublicId: yup.mixed(),
  }),
});

export default index;

export const FIELDS =
  "name yearGroup school biography academicsTutoring extrasTutoring pfp";

export function docToRecord(doc) {
  const tutor = { ...doc };
  tutor.objectID = doc._id;
  tutor.academics = doc.academicsTutoring;
  tutor.extras = doc.extrasTutoring;
  delete tutor._id;
  return indexSchema.validateSync(tutor, { stripUnknown: true });
}

export async function addDocToRecord(doc) {
  const record = docToRecord(doc);
  await index.saveObject(record);
}

export async function indexAll() {
  const docs = await User.find({ "tutor.status": "COMPLETE" }, FIELDS).lean();
  const tutors = docs.map(docToRecord);
  await index.saveObjects(tutors);
  console.log("Reindexed tutors");
}
