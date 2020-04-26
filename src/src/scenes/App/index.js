import React from "react";

import ApolloClient, { gql } from "apollo-boost";
import { ApolloProvider } from "@apollo/react-hooks";

import Routes from "../../routes";
import Authentication from "../../services/Authentication";

import "../../styles/app.scss";

const client = new ApolloClient({
  uri: process.env.REACT_APP_BACKEND_URI,
  typeDefs: gql`
    enum UserType {
      TUTEE
      TUTOR
    }
  `,
});

function App() {
  return (
    <div className="App">
      <ApolloProvider client={client}>
        <Authentication
          children={(authService) => <Routes authService={authService} />}
        />
      </ApolloProvider>
    </div>
  );
}

export default App;
