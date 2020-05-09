import React from "react";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faEllipsisV,
  faPenAlt,
  faUserCog,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../../../class.module.scss";

const Menu = ({
  menuOpen,
  setMenuOpen,
  editEnabled,
  setEditEnabled,
  setModalOpen,
  toggleDisabled,
}) => {
  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((st) => !st);
  };

  const toggleEdit = () => {
    setEditEnabled((st) => !st);
  };

  const openModal = () => {
    toggleDisabled("preferences");
    setModalOpen(true);
  };

  return (
    <div className={styles.menu}>
      <div>
        <button className="btn secondary" onClick={toggleMenu}>
          <FontAwesomeIcon icon={faEllipsisV} size="lg" />
        </button>
      </div>
      <div
        className={classNames(styles.content, {
          [styles.open]: menuOpen,
        })}
      >
        <div onClick={toggleEdit}>
          {editEnabled ? "Lock Edits" : "Edit Page"}{" "}
          <FontAwesomeIcon icon={editEnabled ? faUnlock : faPenAlt} />
        </div>
        <div onClick={openModal}>
          Preferences <FontAwesomeIcon icon={faUserCog} />
        </div>
      </div>
    </div>
  );
};

export default Menu;
