import React from "react";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

const Menu = ({ children, menuOpen, toggleMenu, icon = faBars }) => {
  return (
    <div className={styles.Menu}>
      <div>
        <button className="btn secondary small" onClick={toggleMenu}>
          <FontAwesomeIcon icon={icon} />
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
