import { gql } from "apollo-server";

export default gql`
  type ChatEvent {
    type: String!
    time: Date!
    author: ID!
    text: String
  }

  input ChatEventIn {
    type: String!
    time: Date!
    text: String
  }

  type Chat {
    channel: ID!
    class: Class
    users: [User]
    events: [ChatEvent]
  }

  extend type Query {
    getChat(channel: ID!): Chat!
  }

  extend type Mutation {
    sendEvent(channel: ID!, event: ChatEventIn!): Boolean
  }
`;
