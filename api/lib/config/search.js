import algoliasearch from "algoliasearch";
import User from "../modules/user/model";

const { ALGOLIA_APPID, ALGOLIA_ADMIN_API } = process.env;

const client = algoliasearch(ALGOLIA_APPID, ALGOLIA_ADMIN_API);
export const index = client.initIndex("dev_TUTORS");

export const FIELDS = "name yearGroup school biography academics extras pfp";

export function docToRecord(doc) {
  const tutor = { ...doc };
  tutor.objectID = doc._id;
  delete tutor._id;
  return tutor;
}

export async function addDocToRecord(doc) {
  const record = docToRecord(doc);
  await index.saveObject(record);
}

export async function indexAll() {
  try {
    const docs = await User.find({ userType: "TUTOR" }, FIELDS).lean();

    const tutors = docs.map(docToRecord);
    await index.saveObjects(tutors);
    console.log("success in reindexing tutors");
  } catch (e) {
    console.error(e);
  }
}
