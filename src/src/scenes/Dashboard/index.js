import React from "react";
import useAuth from "../../hooks/useAuth";
import { Switch, Route, Redirect } from "react-router-dom";

import Appbar from "../../components/Appbar";
import Main from "./scenes/Main";
import Search from "./scenes/Search";
import Tutors from "./scenes/Tutors";
import Tutor from "./scenes/Tutor";
import Sessions from "./scenes/Sessions";
import Session from "./scenes/Session";
import Classes from "./scenes/Classes";
import Class from "./scenes/Class";

import "./quill.scss";
import styles from "./styles.module.scss";

const Dashboard = ({ location, match, authService }) => {
  const { currentUser } = authService;
  useAuth(currentUser?.user?.registrationStatus, ["app"]);

  const { path } = match;

  return (
    <div className={styles.Dashboard}>
      <Appbar />
      <div className={styles.content}>
        <Switch>
          <Route exact path={path}>
            <Main />
          </Route>
          <Route exact path={`${path}/search`}>
            <Search />
          </Route>
          <Route exact path={`${path}/tutors`}>
            <Tutors />
          </Route>
          <Route exact path={`${path}/tutors/:id`}>
            <Tutor />
          </Route>
          <Route exact path={`${path}/sessions`}>
            <Sessions />
          </Route>
          <Route exact path={`${path}/sessions/:id`}>
            <Session currentUser={currentUser} />
          </Route>
          <Route exact path={`${path}/classes`}>
            <Classes />
          </Route>
          <Route exact path={`${path}/classes/:id`}>
            <Class currentUser={currentUser} />
          </Route>
          <Route path={path}>
            <Redirect to={location.pathname.replace(path, "")} />
          </Route>
        </Switch>
      </div>
    </div>
  );
};

export default Dashboard;
