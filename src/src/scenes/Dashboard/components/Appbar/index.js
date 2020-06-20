import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";

const Appbar = () => {
  return (
    <div className={styles.Sidebar}>
      <div>
        <Link to="/dashboard">
          <h3>Dashboard</h3>
        </Link>
        <Link to="/dashboard/search">
          <h3>Search</h3>
        </Link>
        <Link to="/dashboard/sessions">
          <h3>Sessions</h3>
        </Link>
        <Link to="/dashboard/classes">
          <h3>Classes</h3>
        </Link>
        <Link to="/dashboard/tutors">
          <h3>Tutors</h3>
        </Link>
        <Link to="/dashboard/chats">
          <h3>Chats</h3>
        </Link>
      </div>
    </div>
  );
};

export default Appbar;
