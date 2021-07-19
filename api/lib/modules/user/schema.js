import { gql } from "apollo-server";

export default gql`
  enum UserType {
    TUTEE
    TUTOR
  }

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

  "A User (can be a tutor, a tutee or a parent)"
  type User {
    _id: ID!
    userType: UserType!
    registrationStatus: String!
    name: String!
    email: String!
    pfp: Pfp
    yearGroup: Int!
    school: String!
    academics: [String!]!
    extras: [String!]
    biography: String!
    grades: String
    price: Int
    classes(limit: Int): [Class!]
    sessions(limit: Int, old: Boolean, time: Date): [Session!]
    chats: [Chat]
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
    getUsers(value: String!, userType: UserType!): [User!]
    getTutors(limit: Int): [User!]
    login(email: String, password: String, tokenId: String): UserReq!
    resetPassword(email: String!): Boolean
  }

  extend type Mutation {
    register(
      userType: UserType!
      name: String!
      email: String!
      password: String
      pfp: PfpIn
      yearGroup: Int!
      school: String!
      academics: [String!]!
      extras: [String!]
      biography: String!
      grades: String
      price: Int
      token: String!
    ): UserReq!
    updateUser(
      id: ID!
      name: String
      pfp: PfpIn
      yearGroup: Int
      school: String
      academics: [String!]
      extras: [String!]
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
