import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenAlt, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

import styles from "../../class.module.scss";

const EditButton = ({
  disabled,
  toggleDisabled,
  cancelUpdate,
  editEnabled,
}) => {
  return ({ type }) => {
    const onCancel = () => cancelUpdate(type);
    const onClick = () => toggleDisabled(type);

    if (editEnabled)
      return (
        <div className={styles.edit}>
          {!disabled[type] && (
            <button className="btn small" onClick={onCancel}>
              <FontAwesomeIcon icon={faTimes} size="lg" />
            </button>
          )}
          <button className="btn small" onClick={onClick}>
            <FontAwesomeIcon icon={disabled[type] ? faPenAlt : faSave} />
          </button>
        </div>
      );
    return null;
  };
};

export default EditButton;
