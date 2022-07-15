import React from "react";
import { Link, NavLink } from "react-router-dom";
import styled from "styled-components";
import mediaQuery from "../../../../styles/sizes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSignOutAlt, faTimes } from "@fortawesome/free-solid-svg-icons";
import {
  faHome,
  faUser,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

const StyledAppbar = styled.div`
  top: 0;
  left: ${(props) => (props.appbarOpen ? "0" : "-100%")};
  position: fixed;
  background-color: #23395b;
  color: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.1);
  width: 100%;
  max-width: 250px;
  height: 100%;
  min-height: 100vh;
  box-sizing: border-box;
  font-family: "Montserrat", sans-serif;
  padding: 2rem 0;
  display: flex;
  flex-direction: column;
  z-index: 5;
  transition: left 200ms;

  ${mediaQuery("lg")`
    left: 0;
    position: sticky;
  `}
`;

const AppbarSection = styled(NavLink)`
  font-size: 1.4rem;
  padding: 1rem 1.5rem;
  transition: background 200ms ease;
  text-transform: uppercase;
  display: block;

  &:hover {
    background-color: #677b9a;
  }

  &.active {
    background: #677b9a;
    background: linear-gradient(90deg, #677b9a 0%, #80a1d2 100%);
  }

  h3 {
    margin: 0;
  }
`;

const CloseMenu = styled.div`
  font-size: 1.4rem;
  padding: 1rem 1.5rem;
  cursor: pointer;
  ${mediaQuery("lg")`
    display: none;
  `}
`;

const OtherLinks = styled.div`
  margin-top: auto;
  margin-bottom: 0;
  padding: 0.8rem 1.5rem;
`;

const Appbar = ({ currentUser, appbarOpen, setAppbarOpen }) => {
  const closeMenu = () => setAppbarOpen(false);

  return (
    <StyledAppbar appbarOpen={appbarOpen}>
      <CloseMenu onClick={closeMenu}>
        Close Menu <FontAwesomeIcon icon={faTimes} />
      </CloseMenu>

      <div>
        {[
          {
            name: "Dashboard",
            link: "/dashboard",
          },
          {
            name: "Search",
            link: "/dashboard/search",
          },
          {
            name: "Request",
            link: "/dashboard/request",
          },
          {
            name: "My Sessions",
            link: "/dashboard/sessions",
          },
          {
            name: "My Tutors",
            link: "/dashboard/tutors",
          },
          {
            name: "My Chats",
            link: "/dashboard/chats",
          },
        ].map((section) => (
          <AppbarSection
            to={section.link}
            key={section.name}
            activeClassName="active"
            onClick={closeMenu}
            exact
          >
            <h3>{section.name}</h3>
          </AppbarSection>
        ))}
      </div>
      <OtherLinks>
        {currentUser.user.admin?.status && (
          <Link to="/admin">
            <p>
              Admin Panel <FontAwesomeIcon icon={faUserShield} />
            </p>
          </Link>
        )}
        <Link to="/dashboard/me" onClick={closeMenu}>
          <p>
            User Profile <FontAwesomeIcon icon={faUser} />
          </p>
        </Link>
        <Link to="/">
          <p>
            Minerva Info <FontAwesomeIcon icon={faHome} />
          </p>
        </Link>
        <Link to="/auth/logout">
          <p>
            Logout <FontAwesomeIcon icon={faSignOutAlt} />
          </p>
        </Link>
      </OtherLinks>
    </StyledAppbar>
  );
};

export default Appbar;
