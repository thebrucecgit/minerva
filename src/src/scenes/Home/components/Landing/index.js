import React from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUserGraduate } from "@fortawesome/free-solid-svg-icons";

import bookshelves from "./media/bookshelves.jpg";

import styles from "./styles.module.scss";

function Landing() {
  return (
    <section className={styles.Landing}>
      <div className={styles.overlay}>
        <div className={styles.front}>
          <div className={styles.description}>
            <h1>
              <span>Minerva</span>
            </h1>
            <p>
              We make academic success easy and accessible, resourcing you with
              all the skills and experience necessary to reach your maximum
              potential.
            </p>
          </div>
          <div className={styles.signUp}>
            <h2>
              Sign Up <FontAwesomeIcon icon={faUserGraduate} />
            </h2>
            <Link to="/signup">
              <button className="btn">I want to get tutored</button>
            </Link>
            <Link to="/tutors">
              <button className="btn">I want to tutor others</button>
            </Link>
          </div>
        </div>
      </div>
      <img
        className={styles.bookFlipping}
        src={bookshelves}
        alt="bookshelves"
      />
    </section>
  );
}

export default Landing;
