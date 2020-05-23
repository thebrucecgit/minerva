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
    const onCancel = () => cancelEdit(type);
    const onEdit = () => startEdit(type);
    const onSave = () => saveInfo(type);

    if (enabledOverride ?? editEnabled)
      return (
        <div className={styles.edit}>
          {disabled[type] ? (
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
