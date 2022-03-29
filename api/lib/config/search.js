import algoliasearch from "algoliasearch";
import User from "../modules/user/model";
import * as yup from "yup";

const { ALGOLIA_APPID, ALGOLIA_ADMIN_API, ALGOLIA_INDEX } = process.env;

export const client = algoliasearch(ALGOLIA_APPID, ALGOLIA_ADMIN_API);
const index = client.initIndex(ALGOLIA_INDEX);
const descSortByPrice = client.initIndex(`${ALGOLIA_INDEX}_price_desc`);
const ascSortByPrice = client.initIndex(`${ALGOLIA_INDEX}_price_asc`);

const indexSchema = yup.object().shape({
  objectID: yup.string().required(),
  name: yup.string(),
  yearGroup: yup.string(),
  school: yup.string(),
  biography: yup.string(),
  academics: yup.array().of(yup.string()),
  pfp: yup.object().shape({
    type: yup.string(),
    url: yup.string(),
    cloudinaryPublicId: yup.mixed(),
  }),
  type: yup.string().oneOf(["GENERAL", "LOCAL"]),
  curricula: yup.array().of(yup.string()),
  location: yup.string().nullable(),
  online: yup.boolean().nullable(),
  price: yup.number(),
  randomness: yup.number(),
});

export default index;

export const FIELDS =
  "name yearGroup school biography pfp tutor.type tutor.curricula tutor.academicsTutoring tutor.price tutor.location tutor.online";

const defaultRankings = [
  "typo",
  "geo",
  "words",
  "filters",
  "proximity",
  "attribute",
  "exact",
  "custom",
];

export async function setSettings() {
  try {
    await index.setSettings(
      {
        searchableAttributes: [
          "unordered(name)",
          "unordered(school)",
          "unordered(yearGroup)",
          "unordered(biography)",
          "unordered(academics)",
          "unordered(curricula)",
          "unordered(location)",
        ],
        attributesForFaceting: [
          "academics",
          "curricula",
          "school",
          "type",
          "location",
          "online",
        ],
        replicas: [`${ALGOLIA_INDEX}_price_desc`, `${ALGOLIA_INDEX}_price_asc`],
        ranking: [...defaultRankings],
        customRanking: ["asc(randomness)"],
      },
      { forwardToReplicas: true }
    );
    await descSortByPrice.setSettings({
      ranking: ["desc(price)", ...defaultRankings],
    });
    await ascSortByPrice.setSettings({
      ranking: ["asc(price)", ...defaultRankings],
    });
  } catch (e) {
    console.error(e);
  }
}

export function docToRecord(doc) {
  const tutor = {
    ...doc,
    ...doc.tutor,
    academics: doc.tutor.academicsTutoring,
    randomness: Math.floor(Math.random() * 100),
  };
  tutor.objectID = doc._id;
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
