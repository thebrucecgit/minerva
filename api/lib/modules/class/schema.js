import { gql } from "apollo-server";

export default gql`
  "A Class consisting with tutors and students"
  type ClassPreference {
    publicClass: Boolean!
    studentInstantiation: Boolean!
    studentAgreeSessions: Boolean!
    online: Boolean!
    enableChat: Boolean!
  }

  input ClassPreferenceIn {
    publicClass: Boolean
    studentInstantiation: Boolean
    studentAgreeSessions: Boolean
    online: Boolean
    enableChat: Boolean
  }

  "A class, from which sessions can be constructed from"
  type Class {
    _id: ID!
    name: String!
    sessions(time: Date, limit: Int, old: Boolean): [Session!]
    tutees: [User!]!
    tutors: [User!]!
    description: String
    location: Location
    pricePerTutee: String
    tags: [String]
    date: String
    image: String
    preferences: ClassPreference!
    videoLink: String
    chat: Chat
  }

  extend type Query {
    getClass(id: ID!): Class!
  }

  extend type Mutation {
    createClass(name: String!): Class!
    updateClass(
      id: ID!
      name: String
      sessions: [ID!]
      tutees: [ID!]
      tutors: [ID!]
      description: String
      location: LocationIn
      pricePerTutee: Int
      tags: [String]
      date: String
      image: String
      preferences: ClassPreferenceIn
    ): Class!
    deleteClass(id: ID!): Boolean
    leaveClass(id: ID!): Boolean
  }
`;
