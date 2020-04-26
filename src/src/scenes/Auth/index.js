import React from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import Navbar from "../../components/Navbar";

import Login from "./scenes/Login";
import EmailConfirmation from "./scenes/EmailConfirmation";
import PasswordReset from "./scenes/PasswordReset";

function Auth({ match, location, authService }) {
  const { path } = match;
  const {
    login,
    logout,
    currentUser,
    confirmUserEmail,
    resetPassword,
    updatePassword,
  } = authService;

  if (location.pathname === `${path}/logout`) {
    logout();
    return null;
  }

  return (
    <div>
      <Navbar menu={false} dark />
      <div className="container">
        <Switch>
          <Route exact path={path}>
            <Login login={login} currentUser={currentUser} />
          </Route>

          <Route path={`${path}/confirm`}>
            <EmailConfirmation
              confirmUserEmail={confirmUserEmail}
              location={location}
            />
          </Route>

          {/* <Route path={`${path}/confirm/:emailConfirmId`}>
            <EmailConfirmation
              currentUser={currentUser}
              confirmUserEmail={confirmUserEmail}
            />
          </Route> */}

          <Route exact path={`${path}/passwordreset`}>
            <PasswordReset
              resetPassword={resetPassword}
              updatePassword={updatePassword}
            />
          </Route>

          <Route path={path}>
            <Redirect to={location.pathname.replace(path, "")} />
          </Route>
        </Switch>
      </div>
    </div>
  );
}

export default Auth;
