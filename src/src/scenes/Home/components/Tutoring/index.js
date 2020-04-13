import React from "react";
import classNames from "classnames";
import styles from "../../../../styles/Tutoring.module.scss";

function Tutoring() {
  return (
    <section className={classNames(styles.Tutoring, styles.gold)}>
      <div className="container">
        <h2>Services</h2>
        <div className={styles.row}>
          <a className={styles.service} href="/services/academic-studies">
            <h3>Academic Studies</h3>
          </a>
          <a className={styles.service} href="/services/extra-curriculars">
            <h3>Extra-Curriculars</h3>
          </a>
        </div>
        <p>
          <em>We will help you achieve your full potential</em>
        </p>
      </div>
    </section>
  );
}

export default Tutoring;
