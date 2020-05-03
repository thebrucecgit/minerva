import React from "react";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenAlt, faSave } from "@fortawesome/free-solid-svg-icons";

import styles from "../../class.module.scss";

const EditButton = ({ currentUser, disabled, toggleDisabled }) => {
  return ({ type }) => {
    if (currentUser.user.userType === "TUTOR")
      return (
        <button
          className={classNames("btn", styles.edit)}
          onClick={() => toggleDisabled(type)}
        >
          <FontAwesomeIcon icon={disabled[type] ? faPenAlt : faSave} />
        </button>
      );
    return null;
  };
};

export default EditButton;
