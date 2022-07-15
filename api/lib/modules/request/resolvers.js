import getRequestsOfUser from "./queries/getRequestsOfUser";
import createTutorRequest from "./mutations/createTutorRequest";

export default {
  Query: {
    getRequestsOfUser,
  },
  Mutation: {
    createTutorRequest,
  },
};
