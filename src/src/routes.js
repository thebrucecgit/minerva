import React from "react";
import { Switch, Route } from "react-router-dom";

import Home from "./scenes/Home";
import Pages from "./scenes/Pages";
import Signups from "./scenes/Signups";
import Auth from "./scenes/Auth";

// import Dashboard from "./scenes/Dashboard";

function Routes({ authService }) {
  const { currentUser } = authService;
  return (
    <Switch>
      <Route exact path="/">
        <Home />
      </Route>

      <Route
        path="/auth"
        render={({ match, location }) => (
          <Auth match={match} location={location} authService={authService} />
        )}
      />

      <Route
        path="/signup"
        render={({ authService, match }) => <Signups match={match} />}
      />

      <Route path="/" render={({ match }) => <Pages match={match} />} />
    </Switch>
  );
}

export default Routes;
