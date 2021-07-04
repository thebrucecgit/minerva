import React from "react";

import { ApolloClient, HttpLink, ApolloLink, ApolloProvider, InMemoryCache } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
// import { withClientState } from "apollo-link-state";
import { loader } from "graphql.macro";

const typeDefs = loader("./graphql/typedefs.gql");

const errorHandler = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(
        `[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`
      )
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

function authHandler(token = "") {
  return new ApolloLink((operation, forward) => {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${token}`,
      },
    }));
    return forward(operation);
  });
}

const cleanTypeName = new ApolloLink((operation, forward) => {
  if (operation.variables) {
    const omitTypename = (key, value) =>
      key === "__typename" ? undefined : value;
    operation.variables = JSON.parse(
      JSON.stringify(operation.variables),
      omitTypename
    );
  }
  return forward(operation).map((data) => {
    return data;
  });
});

const Apollo = ({ authHelpers, children }) => {
  const token = authHelpers.currentUser?.jwt;

  const client = new ApolloClient({
    link: ApolloLink.from([
      errorHandler,
      authHandler(token),
      cleanTypeName,
      new HttpLink({
        uri: process.env.REACT_APP_API_URI,
      }),
    ]),
    typeDefs,
    cache: new InMemoryCache(),
    defaultOptions: {
      watchQuery: {
        fetchPolicy: "cache-and-network",
      },
    },
  });

  return <ApolloProvider client={client}>{children}</ApolloProvider>;
};

export default Apollo;
