const { ApolloServer, gql } = require("apollo-server");

const typeDefs = gql`
  type Book {
    title: String
    author: [Author]
  }

  type Author {
    name: String
    books: [Book]
  }

  type Query {
    books: [Book]
    authors: [Author]
  }
`;

const books = [
  {
    title: "Harry Potter and the Chamber of Secrets",
    author: "J.K. Rowling"
  },
  {
    title: "Jurassic Park",
    author: "Michael Crichton"
  }
];

const authors = [
  {
    name: "J.K. Rowling"
  },
  {
    name: "Michale Crichton"
  }
];

const resolvers = {
  Query: {
    books: () => books,
    authors: () => authors
  }
};

const server = new ApolloServer({ typeDefs, resolvers });

server.listen().then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
