import { gql } from "apollo-server";

export default gql`
  type Pfp {
    type: String
    url: String
    cloudinaryPublicId: String
  }

  input PfpIn {
    type: String!
    url: String!
    cloudinaryPublicId: String
  }

  type TutorStatus {
    status: String
    grades: String
  }

  type AdminStatus {
    status: Boolean
  }

  "A User (can be a tutor, a tutee or a parent)"
  type User {
    _id: ID!
    registrationStatus: String!
    name: String!
    email: String!
    pfp: Pfp
    yearGroup: Int!
    school: String!
    academicsLearning: [String!]!
    extrasLearning: [String!]
    academicsTutoring: [String!]
    extrasTutoring: [String!]
    biography: String!
    grades: String
    tutor: TutorStatus
    admin: AdminStatus
  }

  "The object that is returned when a user is authenticated"
  type UserReq {
    jwt: String!
    exp: Int!
    registered: Boolean!
    user: User!
  }

  extend type Query {
    getUser(id: ID): User!
    getUsers(value: String!): [User!]
    getTutorsOfUser(userID: ID!, limit: Int): [User!]
    getPendingTutors: [User!]!
    login(email: String, password: String, tokenId: String): UserReq!
    resetPassword(email: String!): Boolean
  }

  extend type Mutation {
    register(
      name: String!
      email: String!
      password: String
      pfp: PfpIn
      yearGroup: Int!
      school: String!
      academicsLearning: [String!]
      extrasLearning: [String!]
      academicsTutoring: [String!]
      extrasTutoring: [String!]
      biography: String!
      grades: String
      token: String!
      applyTutor: Boolean!
    ): UserReq!
    updateUser(
      id: ID!
      name: String
      pfp: PfpIn
      yearGroup: Int
      school: String
      academicsLearning: [String!]
      extrasLearning: [String!]
      academicsTutoring: [String!]
      extrasTutoring: [String!]
      biography: String
    ): User!
    confirmUserEmail(emailConfirmId: String!): UserReq!
    resetPassword(email: String!): Boolean
    updatePassword(
      email: String!
      passwordResetCode: Int!
      newPassword: String!
    ): UserReq!
    reviewUser(id: ID!, approval: Boolean!, message: String): Boolean
  }
`;
