import React from "react";
import { Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faMapMarkedAlt,
  faMoneyCheckAlt,
  faThumbsUp,
  faLaughSquint
} from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

function Features() {
  return (
    <section className={styles.Features}>
      <h2>Why Us?</h2>
      <div className={styles.row}>
        <div>
          <FontAwesomeIcon icon={faMapMarkedAlt} size="8x" />
          <h4>Local</h4>
          <p>We are only in specific Christchurch schools!</p>
        </div>
        <div>
          <FontAwesomeIcon icon={faMoneyCheckAlt} size="8x" />
          <h4>Affordable</h4>
          <p>
            Our prices are fair and our intentions are not to seek financial
            profit.
          </p>
        </div>
        <div>
          <FontAwesomeIcon icon={faThumbsUp} size="8x" />
          <h4>Effective</h4>
          <p>
            Receive support from top students who have completed the same
            courses as you.
          </p>
        </div>
        <div>
          <FontAwesomeIcon icon={faLaughSquint} size="8x" />
          <h4>Comfort</h4>
          <p>Feel at ease with another student just like you!</p>
        </div>
      </div>
      <Link to="/signup">
        <button>Get Started</button>
      </Link>
    </section>
  );
}

export default Features;
