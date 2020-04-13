import React from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import logo from "../../media/logo.png";
import styles from "./styles.module.scss";

function Navbar({ set }) {
  const openMenu = () => {
    set(true);
  };
  return (
    <nav className={styles.Navbar}>
      <Link to="/">
        <img src={logo} alt="Academe Logo" />
        <h1>Academe</h1>
      </Link>
      <div className={styles.menutoggle} onClick={openMenu}>
        <FontAwesomeIcon icon={faBars} />
      </div>
    </nav>
  );
}

export default Navbar;
