import { gql } from "apollo-server";

export default gql`
  "Recording attendance of a class"
  type Attendance {
    tutee: User!
    attended: Boolean!
    reason: String
  }

  "The location of a session or class"
  type Location {
    address: String
    coords: Coord
  }

  "The specific coordinates of a location"
  type Coord {
    lat: Float
    lng: Float
  }

  input AttendanceIn {
    tutee: ID!
    attended: Boolean!
    reason: String
  }

  input LocationIn {
    address: String
    coords: CoordIn
  }

  input CoordIn {
    lat: Float
    lng: Float
  }

  "An instance of a class, occurring at a specified time"
  type Session {
    _id: ID!
    class: Class!
    attendance: [Attendance!]!
    tutors: [User!]!
    location: Location
    price: String
    time: Date
    length: Int
    notes: String
  }

  extend type Query {
    getSession(id: ID!): Session!
    getSessions: [Session!]!
  }

  extend type Mutation {
    instantiateSession(classId: ID!, time: Date!, length: Int!): Session!
    updateSession(
      id: ID!
      class: ID
      attendance: [AttendanceIn!]
      tutors: [ID!]
      location: LocationIn
      price: String
      time: Date
      length: Int
      notes: String
    ): Session!
  }
`;
