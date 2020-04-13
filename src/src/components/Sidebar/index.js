import React from "react";
import { Link as RouterLink } from "react-router-dom";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faCaretDown } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

function Sidebar({ open = false, set }) {
  const closeMenu = () => {
    set(false);
  };

  /**
   * Wrapper around Link component of react router
   * @param {*} props
   */

  const Link = props => {
    return (
      <RouterLink
        {...props}
        onClick={closeMenu}
        className={classNames(styles.link, props.className)}
      />
    );
  };

  return (
    <nav className={classNames(styles.Sidebar, { [styles.active]: open })}>
      <h2>
        <span>Menu</span>
        <FontAwesomeIcon
          icon={faTimes}
          className={classNames(styles.dismiss, styles.icons)}
          onClick={closeMenu}
        />
      </h2>
      <ul className="unstyled">
        <li>
          <Link to="/" className="active">
            Home
          </Link>
        </li>
        <li>
          <Link to="/about-us">About Us</Link>
        </li>
        <li>
          <span className={styles.link}>
            <span>Services</span>
            <FontAwesomeIcon icon={faCaretDown} className={styles.icons} />
          </span>
          <ul className="unstyled">
            <li>
              <Link to="/services">Overview</Link>
            </li>
            <li>
              <Link to="/services/academic-studies">Academic Studies</Link>
            </li>
            <li>
              <Link to="/services/extra-curriculars">Extra-Curriculars</Link>
            </li>
          </ul>
        </li>
        <li>
          <Link to="/tutors">Tutors</Link>
        </li>
      </ul>
    </nav>
  );
}

export default Sidebar;
