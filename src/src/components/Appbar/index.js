import React from "react";
import { Link } from "react-router-dom";
import styles from "./styles.module.scss";

const Appbar = () => {
  return (
    <div className={styles.Sidebar}>
      <div>
        <Link to="">
          <h3>Search</h3>
        </Link>
        <Link to="">
          <h3>Sessions</h3>
        </Link>
        <Link to="">
          <h3>Classes</h3>
        </Link>
        <Link to="">
          <h3>Tutors</h3>
        </Link>
      </div>
    </div>
  );
};

export default Appbar;
