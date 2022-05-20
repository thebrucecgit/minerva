import React, { useState } from "react";
import { Switch, Route, Redirect } from "react-router-dom";

import useChat from "./hooks/useChat";

import Appbar from "./components/Appbar";
import AppbarToggle from "./components/AppbarToggle";
import Main from "./scenes/Main";
import Search from "./scenes/Search";
import Tutors from "./scenes/Tutors";
import User from "./scenes/User";
import Sessions from "./scenes/Sessions";
import Session from "./scenes/Session";
// import Classes from "./scenes/Classes";
// import Class from "./scenes/Class";
// import Attendance from "./scenes/Attendance";
import Chats from "./scenes/Chats";
import PersonalInfo from "./scenes/PersonalInfo";

import "./quill.scss";
import styled from "styled-components";
import useModal from "./hooks/useModal";
import Onboarding from "./components/Onboarding";

const StyledDashboard = styled.div`
  display: flex;

  h1 {
    font-size: 3rem;
    margin: 1rem $text-padding;
  }

  h2 {
    font-size: 2rem;
    margin: 0;
  }

  img {
    display: block;
  }
`;

const Content = styled.div`
  width: 100%;
`;

const Dashboard = ({ location, match, authService }) => {
  const { currentUser } = authService;

  const [appbarOpen, setAppbarOpen] = useState(false);
  const toggleAppbar = () => {
    setAppbarOpen((st) => !st);
  };

  const [openOnboarding, onboardingBinds] = useModal(false);

  const ws = useChat(currentUser);

  const { path } = match;

  const pageBinds = { currentUser, ws };

  return (
    <StyledDashboard>
      <Appbar
        {...pageBinds}
        appbarOpen={appbarOpen}
        setAppbarOpen={setAppbarOpen}
      />
      <AppbarToggle
        {...pageBinds}
        appbarOpen={appbarOpen}
        toggleAppbar={toggleAppbar}
      />
      <Content>
        <Switch>
          <Route exact path={path}>
            <Main {...pageBinds} />
          </Route>
          <Route exact path={`${path}/search`}>
            <Search {...pageBinds} />
          </Route>
          <Route exact path={`${path}/tutors`}>
            <Tutors {...pageBinds} />
          </Route>
          <Route exact path={`${path}/tutors/:id`}>
            <User {...pageBinds} />
          </Route>
          <Route exact path={`${path}/sessions`}>
            <Sessions {...pageBinds} />
          </Route>
          <Route exact path={`${path}/sessions/:id`}>
            <Session {...pageBinds} />
          </Route>
          {/* <Route exact path={`${path}/classes`}>
            <Classes {...pageBinds} />
          </Route>
          <Route exact path={`${path}/classes/:id`}>
            <Class {...pageBinds} />
          </Route>
          <Route exact path={`${path}/classes/:id/attendance`}>
            <Attendance {...pageBinds} />
          </Route> */}
          <Route exact path={`${path}/me`}>
            <PersonalInfo {...pageBinds} />
          </Route>
          <Route
            path={`${path}/chats`}
            render={({ match }) => <Chats match={match} {...pageBinds} />}
          />
          <Route path={path}>
            <Redirect to={location.pathname.replace(path, "")} />
          </Route>
        </Switch>
      </Content>
      <Onboarding {...onboardingBinds} currentUser={currentUser} />
    </StyledDashboard>
  );
};

export default Dashboard;
