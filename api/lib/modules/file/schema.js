import { gql } from "apollo-server";

export default gql`
  type FileMeta {
    id: ID!
    name: String
    size: Int
    type: String
    link: String
  }

  "File metadata"
  input FileMetaIn {
    id: ID!
    name: String
    size: Int
    type: String
  }

  extend type Query {
    getUploadUrl(fileName: String): String!
  }
`;
