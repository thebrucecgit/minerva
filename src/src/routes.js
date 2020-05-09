import React, { Suspense, lazy } from "react";
import { Switch, Route } from "react-router-dom";

import Loader from "./components/Loader";

const Home = lazy(() => import("./scenes/Home"));
const Pages = lazy(() => import("./scenes/Pages"));
const Signups = lazy(() => import("./scenes/Signups"));
const Auth = lazy(() => import("./scenes/Auth"));
const Dashboard = lazy(() => import("./scenes/Dashboard"));

function Routes({ authService }) {
  return (
    <Suspense fallback={<Loader />}>
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

        <Route
          path="/dashboard"
          render={({ match, location }) => (
            <Dashboard
              match={match}
              location={location}
              authService={authService}
            />
          )}
        />

        <Route path="/" render={({ match }) => <Pages match={match} />} />
      </Switch>
    </Suspense>
  );
}

export default Routes;
