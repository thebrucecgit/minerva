import React from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import logo from "../../media/logo.png";
import styles from "./styles.module.scss";

function Navbar({ set, menu = true, dark = false }) {
  const openMenu = () => {
    set(true);
  };
  return (
    <nav className={classNames(styles.Navbar, { [styles.dark]: dark })}>
      <Link to="/">
        <img src={logo} alt="Minerva Logo" />
      </Link>
      {menu && (
        <div className={styles.menutoggle} onClick={openMenu}>
          <FontAwesomeIcon icon={faBars} />
        </div>
      )}
    </nav>
  );
}

export default Navbar;
