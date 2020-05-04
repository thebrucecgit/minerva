import React from "react";
import { Link } from "react-router-dom";
import { format } from "date-fns";

import styles from "./styles.module.scss";

const SessionSection = ({ session }) => {
  return (
    <div className={styles.SessionSection}>
      <div className={styles.header}>
        <Link to={`/dashboard/sessions/${session._id}`}>
          <h2>{format(session.time, "EEEE d MMMM, yyyy")}</h2>
        </Link>
      </div>
      <div className={styles.body}>
        <p>{session.location.address}</p>
      </div>
    </div>
  );
};

export default SessionSection;
