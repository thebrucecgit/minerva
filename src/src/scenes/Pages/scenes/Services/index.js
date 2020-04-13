import React from "react";
import { Link } from "react-router-dom";

import styles from "../../../../styles/Tutoring.module.scss";

function Services() {
  return (
    <div>
      <div className="header">
        <h1>Our Services</h1>
        {/* include("../partials/google"); */}
      </div>
      <div className="container">
        <p>
          We have an extremely wide range of academic subjects to choose from,
          meaning your Academe experience will be perfectly tailored to your
          needs and wants. If you want more information, or have a message you
          want us to hear, please contact us at{" "}
          <a
            href="mailto:admin@academe.co.nz"
            target="_blank"
            rel="noopener noreferrer"
          >
            admin@academe.co.nz
          </a>
          .
        </p>
        <p>
          We have two general categories of services, Academic studies – such as
          English, Mathematics, and History – and extra-curricular studies –
          such as programming, drama, and music. Whatever you choose to do,
          we'll connect you with excelling students in that area.{" "}
        </p>
        {/* Pictures of famous tutors... */}
        <div className={styles.Tutoring}>
          <div className={styles.row}>
            <Link className={styles.service} to="/services/academic-studies">
              <h3>Academic Studies</h3>
            </Link>
            <Link className={styles.service} to="/services/extras">
              <h3>Extra-Curriculars</h3>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Services;
