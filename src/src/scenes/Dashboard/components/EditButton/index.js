import React from "react";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPenAlt, faSave, faTimes } from "@fortawesome/free-solid-svg-icons";

import styles from "../../class.module.scss";

const EditButton = ({
  disabled,
  startEdit,
  saveInfo,
  cancelEdit,
  editEnabled,
}) => {
  return ({ type, editEnabled: enabledOverride }) => {
    const onCancel = () => {
      if (Array.isArray(type)) type.forEach((t) => cancelEdit(t));
      cancelEdit(type);
    };
    const onEdit = () => {
      if (Array.isArray(type)) type.forEach((t) => startEdit(t));
      startEdit(type);
    };
    const onSave = () => {
      saveInfo(type);
    };

    if (enabledOverride ?? editEnabled)
      return (
        <div className={styles.edit}>
          {(Array.isArray(type) ? disabled[type[0]] : disabled[type]) ? (
            <button className="btn small" onClick={onEdit}>
              <FontAwesomeIcon icon={faPenAlt} />
            </button>
          ) : (
            <>
              <button className="btn small" onClick={onCancel}>
                <FontAwesomeIcon icon={faTimes} size="lg" />
              </button>
              <button className="btn small" onClick={onSave}>
                <FontAwesomeIcon icon={faSave} />
              </button>
            </>
          )}
        </div>
      );
    return null;
  };
};

export default EditButton;
