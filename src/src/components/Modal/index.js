import React from "react";

import styles from "./styles.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ children, onClose, open = false }) => {
  if (!open) return null;

  return (
    <div className={styles.Modal}>
      <div className={styles.box}>
        <button onClick={onClose} className={styles.close}>
          <FontAwesomeIcon icon={faTimes} size="2x" />
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
