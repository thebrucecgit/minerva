import { gql } from "apollo-server";

export default gql`
  type Pfp {
    type: String
    url: String
    cloudinaryPublicId: String
  }

  input PfpIn {
    type: String
    url: String
    cloudinaryPublicId: String
  }

  input TutorInfoIn {
    academicsTutoring: [String!]!
    curricula: [String!]!
    academicRecords: [FileMetaIn!]!
  }

  type TutorInfo {
    type: String!
    status: String
    academicRecords: [FileMeta!]
    academicsTutoring: [String!]!
    curricula: [String!]!
  }

  type AdminStatus {
    status: Boolean
  }

  type FileMeta {
    id: ID!
    name: String
    size: Int
    type: String
  }

  "File metadata"
  input FileMetaIn {
    id: ID!
    name: String
    size: Int
    type: String
  }

  "A User (can be a tutor, a tutee or a parent)"
  type User {
    _id: ID!
    registrationStatus: String!
    name: String!
    email: String!
    pfp: Pfp
    yearGroup: String!
    school: String!
    biography: String!
    tutor: TutorInfo
    admin: AdminStatus
  }

  "The object that is returned when a user is authenticated"
  type UserReq {
    jwt: String!
    exp: Int!
    registered: Boolean!
    algoliaKey: String
    user: User!
  }

  extend type Query {
    getUser(id: ID): User!
    getUsers(value: String!): [User!]
    getTutorsOfUser(userID: ID!, limit: Int): [User!]
    getPendingTutors: [User!]!
    login(email: String, password: String, tokenId: String): UserReq!
    resetPassword(email: String!): Boolean
    getUploadUrl(fileName: String): String!
  }

  extend type Mutation {
    register(
      name: String!
      email: String!
      password: String
      pfp: PfpIn
      yearGroup: String!
      school: String!
      biography: String
      token: String!
      applyTutor: Boolean!
      tertiary: Boolean
      tutor: TutorInfoIn
    ): UserReq!
    updateUser(
      id: ID!
      name: String
      pfp: PfpIn
      yearGroup: String
      school: String
      biography: String
      applyTutor: Boolean
      tertiary: Boolean
      tutor: TutorInfoIn
    ): User!
    confirmUserEmail(emailConfirmId: String!): UserReq!
    resetPassword(email: String!): Boolean
    updatePassword(
      email: String!
      passwordResetCode: Int!
      newPassword: String!
    ): UserReq!
    reviewUser(id: ID!, approval: Boolean!, message: String): Boolean
    indexTutors: Boolean
  }
`;
