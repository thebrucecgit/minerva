import React from "react";
import { Switch, Route } from "react-router-dom";

import Home from "./scenes/Home";
import Pages from "./scenes/Pages";
import Signups from "./scenes/Signups";
import Auth from "./scenes/Auth";

import Dashboard from "./scenes/Dashboard";

function Routes({ authService }) {
  return (
    <Switch>
      <Route exact path="/">
        <Home authService={authService} />
      </Route>

      <Route
        path="/auth"
        render={({ match, location }) => (
          <Auth match={match} location={location} authService={authService} />
        )}
      />

      <Route
        path="/signup"
        render={({ match }) => (
          <Signups match={match} authService={authService} />
        )}
      />

      <Route path="/dashboard">
        <Dashboard authService={authService} />
      </Route>

      <Route path="/" render={({ match }) => <Pages match={match} />} />
    </Switch>
  );
}

export default Routes;
