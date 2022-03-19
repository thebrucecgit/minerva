import { gql } from "apollo-server";

export default gql`
  type SessionUserResponse {
    user: ID!
    response: String! # Enum "CONFIRM" or "REJECT"
  }

  "Recording attendance of a class"
  type Attendance {
    tutee: ID!
    attended: Boolean!
    reason: String
    behaviourTags: [String]
    behaviourComment: String
    behaviourGood: Boolean
  }

  type Review {
    tutee: ID!
    rating: Float
    occurred: String
    reason: String
    comment: String
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

  "Settings for this session (inherits from class initially)"
  type SessionSettings {
    studentEditNotes: Boolean!
    online: Boolean!
  }

  type SessionCancellation {
    user: ID
    cancelled: Boolean!
    reason: String
    date: Date
  }

  input SessionSettingsIn {
    studentEditNotes: Boolean
    online: Boolean
  }

  input AttendanceIn {
    tutee: ID!
    attended: Boolean
    reason: String
    behaviourTags: [String]
    behaviourComment: String
    behaviourGood: Boolean
  }

  input ReviewIn {
    rating: Float
    occurred: String
    reason: String
    comment: String
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
    class: Class
    attendance: [Attendance!]!
    tutors: [User!]!
    tutees: [User!]!
    location: Location
    price: String
    startTime: Date
    endTime: Date
    length: Int
    notes: String
    settings: SessionSettings
    videoLink: String
    cancellation: SessionCancellation!
    status: String!
    userResponses: [SessionUserResponse!]
    review: [Review!]!
  }

  extend type Query {
    getSession(id: ID!): Session!
    getSessionsOfUser(
      userID: ID!
      limit: Int
      old: Boolean
      time: Date
    ): [Session!]!
  }

  extend type Mutation {
    instantiateSession(classId: ID!, startTime: Date!, length: Int!): Session!
    createSession(
      name: String!
      tutors: [ID!]!
      tutees: [ID!]!
      startTime: Date!
      length: Int!
    ): Session!
    updateSession(
      id: ID!
      class: ID
      attendance: [AttendanceIn!]
      tutors: [ID!]
      tutees: [ID!]
      location: LocationIn
      price: String
      startTime: Date
      length: Int
      notes: String
      settings: SessionSettingsIn
    ): Session!
    "Deletes Session and removes session from relations"
    deleteSession(id: ID!): Boolean
    cancelSession(id: ID!, reason: String!): Session
    confirmSession(id: ID!): Session
    rejectSession(id: ID!): Session
    reviewSession(id: ID!, review: ReviewIn!): Session
  }
`;
