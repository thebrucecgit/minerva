import React from "react";
import { Link } from "react-router-dom";
import Loader from "../../../../components/Loader";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

const Main = () => {
  return (
    <div>
      <div className={styles.upper}>
        <div>
          <h1>Sessions</h1>
          <div className={styles.session}>
            <h2>April 4th</h2>
          </div>
        </div>
        <div>
          <h1>Class</h1>
          <div className={styles.session}>
            <h2>Saturday Upper Riccarton</h2>
          </div>
        </div>
      </div>
      <div className={styles.lower}>
        <h1>Tutors</h1>
        <div className={styles.tutors}>
          <div className={styles.tutor}>
            <img src="https://via.placeholder.com/250" alt="" />
            <h3>John Smith</h3>
          </div>
          <div className={styles.tutor}>
            <Link to="/dashboard/search">
              <h3>Search Tutors</h3>
              <FontAwesomeIcon icon={faPlus} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
