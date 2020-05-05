import { gql } from "apollo-server";

export default gql`
  enum UserType {
    TUTEE
    TUTOR
  }

  "A User (can be a tutor, a tutee or a parent)"
  type User {
    _id: ID!
    userType: UserType!
    registrationStatus: String!
    name: String!
    email: String!
    pfp: String
    yearGroup: Int!
    school: String!
    academics: [String!]!
    extras: [String!]
    biography: String!
    grades: String
    price: Int
    classes: [Class!]
    sessions: [Session!]
  }

  "The object that is returned when a user is authenticated"
  type UserReq {
    jwt: String!
    exp: Int!
    registered: Boolean!
    user: User!
  }

  extend type Query {
    getUser(id: ID!): User!
    getTutors: [User!]
    login(email: String, password: String, tokenId: String): UserReq!
    resetPassword(email: String!): Boolean
  }

  extend type Mutation {
    register(
      userType: UserType!
      name: String!
      email: String!
      password: String
      pfp: String
      yearGroup: Int!
      school: String!
      academics: [String!]!
      extras: [String!]
      biography: String!
      grades: String
      price: Int
      token: String!
    ): UserReq!
    confirmUserEmail(emailConfirmId: String!): UserReq!
    resetPassword(email: String!): Boolean
    updatePassword(
      email: String!
      passwordResetCode: Int!
      newPassword: String!
    ): UserReq!
  }
`;
