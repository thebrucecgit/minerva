import { gql } from "apollo-server";

export default gql`
  "A Class consisting with tutors and students"
  type TutorRequest {
    _id: ID!
    requester: User!
    subject: String!
    curriculum: String!
    other: String
    date: Date!
    status: String!
  }

  extend type Query {
    getRequestsOfUser(userID: ID!, limit: Int): [TutorRequest!]!
  }

  extend type Mutation {
    createTutorRequest(
      subject: String!
      curriculum: String!
      other: String
    ): TutorRequest!
  }
`;
