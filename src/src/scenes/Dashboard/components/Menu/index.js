import React from "react";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEllipsisV } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

const Menu = ({ children, menuOpen, toggleMenu, icon = faEllipsisV }) => {
  return (
    <div className={styles.Menu}>
      <div>
        <button className="btn secondary small" onClick={toggleMenu}>
          <FontAwesomeIcon icon={icon} size="lg" />
        </button>
      </div>
      <div
        className={classNames(styles.content, {
          [styles.open]: menuOpen,
        })}
      >
        {children}
      </div>
    </div>
  );
};

export default Menu;
