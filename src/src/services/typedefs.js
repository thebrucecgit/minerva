import gql from "graphql-tag";

export default gql`
  scalar Date
  enum UserType {
    TUTEE
    TUTOR
  }

  input LocationIn {
    address: String
    coords: CoordIn
  }

  input CoordIn {
    lat: Float
    lng: Float
  }
`;
