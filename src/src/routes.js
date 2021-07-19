import React, { Suspense, lazy, useEffect } from "react";
import { Switch, Route, useLocation } from "react-router-dom";

import Loader from "./components/Loader";
import { loader } from "./styles/Loader.module.scss";

const Home = lazy(() => import("./scenes/Home"));
const Pages = lazy(() => import("./scenes/Pages"));
const Signups = lazy(() => import("./scenes/Signups"));
const Confirm = lazy(() => import("./scenes/Confirm"));
const Auth = lazy(() => import("./scenes/Auth"));
const Dashboard = lazy(() => import("./scenes/Dashboard"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Routes({ authService }) {
  return (
    <Suspense
      fallback={
        <div className={loader}>
          <Loader />
        </div>
      }
    >
      <ScrollToTop />
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
          exact
          render={({ match }) => (
            <Signups match={match} authService={authService} />
          )}
        />

        <Route exact path="/signup/confirm">
          <Confirm authService={authService} />
        </Route>

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
