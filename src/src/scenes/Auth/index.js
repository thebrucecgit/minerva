import React from "react";
import { Switch, Route } from "react-router-dom";

import Login from "./scenes/Login";

function Auth({ match, location, authService }) {
  const { path } = match;
  const { login, logout, currentUser } = authService;

  if (location.pathname === `${path}/logout`) logout();

  return (
    <Switch>
      <Route exact path={path}>
        <Login login={login} currentUser={currentUser} />
      </Route>

      {/* <Route exact path={`${path}/passwordreset`}>
        <Logout logout={logout} currentUser={currentUser} />
      </Route> */}
    </Switch>
  );
}

export default Auth;
