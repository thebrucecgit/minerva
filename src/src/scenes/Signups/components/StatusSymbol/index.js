import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

import styles from "../../styles.module.scss";

const StatusSymbol = ({ state }) => {
  return (
    <div className={styles.status}>
      {state !== null && (
        <FontAwesomeIcon
          icon={state ? faCheck : faTimes}
          className={state ? styles.valid : styles.invalid}
        />
      )}
    </div>
  );
};

export default StatusSymbol;
