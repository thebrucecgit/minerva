import { gql } from "apollo-server";

export default gql`
  "A Class consisting with tutors and students"
  type Class {
    _id: ID!
    name: String!
    sessions: [Session!]!
    tutees: [User!]!
    tutors: [User!]!
    description: String
    location: Location
    pricePerTutee: String
    tags: [String]
    date: String
    image: String
  }

  extend type Query {
    getClass(id: ID!): Class!
    getClasses: [Class!]!
  }

  extend type Mutation {
    updateClass(
      id: ID
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
    ): Class!
  }
`;
