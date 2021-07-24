import React from "react";
import { Link, NavLink } from "react-router-dom";
import styles from "./styles.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faHome,
  faUser,
  faUserShield,
} from "@fortawesome/free-solid-svg-icons";

const Appbar = ({ currentUser }) => {
  return (
    <div className={styles.Sidebar}>
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
            name: "Sessions",
            link: "/dashboard/sessions",
          },
          {
            name: "Classes",
            link: "/dashboard/classes",
          },
          {
            name: "Tutors",
            link: "/dashboard/tutors",
          },
          {
            name: "Chats",
            link: "/dashboard/chats",
          },
        ].map((section) => (
          <NavLink
            to={section.link}
            key={section.name}
            activeClassName={styles.active}
            className={styles.section}
            exact
          >
            <h3>{section.name}</h3>
          </NavLink>
        ))}
      </div>
      <div className={styles.home}>
        {currentUser.user.admin?.status && (
          <Link to="/admin">
            <p>
              Admin Panel <FontAwesomeIcon icon={faUserShield} />
            </p>
          </Link>
        )}
        <Link to="/dashboard/me">
          <p>
            User Profile <FontAwesomeIcon icon={faUser} />
          </p>
        </Link>
        <Link to="/">
          <p>
            Academe <FontAwesomeIcon icon={faHome} />
          </p>
        </Link>
      </div>
    </div>
  );
};

export default Appbar;
