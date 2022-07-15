import React, { Suspense, lazy, useEffect } from "react";
import { Switch, Route, useLocation } from "react-router-dom";

import Loader from "./components/Loader";
import { loader } from "./styles/Loader.module.scss";

import Authenticated from "components/Authenticated";

const Pages = lazy(() => import("./scenes/Pages"));
const Signups = lazy(() => import("./scenes/Signups"));
const Confirm = lazy(() => import("./scenes/Confirm"));
const Auth = lazy(() => import("./scenes/Auth"));
const Dashboard = lazy(() => import("./scenes/Dashboard"));
const Admin = lazy(() => import("./scenes/Admin"));

function ScrollToTop() {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}

function Routes({ authService }) {
  const registrationStatus = authService.currentUser?.user?.registrationStatus;

  return (
    <Suspense
      fallback={
        <div className={loader}>
          <Loader instant />
        </div>
      }
    >
      <ScrollToTop />
      <Switch>
        <Route exact path="/">
          {() => {
            if (process.env.NODE_ENV !== "development")
              window.location.replace(process.env.REACT_APP_INFO_SITE);
            return null;
          }}
        </Route>

        <Route
          path="/auth"
          render={({ match, location }) => (
            <Auth match={match} location={location} authService={authService} />
          )}
        />

        <Route exact path="/signup/confirm">
          <Authenticated
            registrationStatus={registrationStatus}
            current={["confirm"]}
          >
            <Confirm authService={authService} />
          </Authenticated>
        </Route>

        <Route
          path="/signup"
          render={({ match }) => (
            <Signups match={match} authService={authService} />
          )}
        />

        <Route
          path="/dashboard"
          render={({ match, location }) => (
            <Authenticated
              registrationStatus={registrationStatus}
              current={["app"]}
            >
              <Dashboard
                match={match}
                location={location}
                authService={authService}
              />
            </Authenticated>
          )}
        />

        <Route
          path="/admin"
          render={({ match, location }) => (
            <Admin
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
