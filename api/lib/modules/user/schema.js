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

  type TutorStatus {
    status: String
    academicRecords: [FileMeta!]
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
    academicsTutoring: [String!]
    biography: String!
    academicRecords: [FileMeta!]
    tutor: TutorStatus
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
      academicsTutoring: [String!]
      biography: String
      academicRecords: [FileMetaIn!]
      token: String!
      applyTutor: Boolean!
    ): UserReq!
    updateUser(
      id: ID!
      name: String
      pfp: PfpIn
      yearGroup: String
      school: String
      academicsTutoring: [String!]
      biography: String
      applyTutor: Boolean
      academicRecords: [FileMetaIn!]
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
