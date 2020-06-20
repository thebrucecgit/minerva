import { gql } from "apollo-server";

export default gql`
  type ChatMessage {
    _id: ID!
    type: String!
    time: Date!
    author: ID!
    text: String
  }

  type Chat {
    channel: ID!
    bindToClass: Boolean
    class: Class
    users: [User]
    messages(limit: Int): [ChatMessage]
  }

  extend type Query {
    getChat(channel: ID!): Chat!
  }
`;
