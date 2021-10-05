import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import Landing from "./components/Landing";
import Information from "./components/Information";
import Tutoring from "./components/Tutoring";
import Features from "./components/Features";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

function Home({ authService }) {
  const [menu, setMenu] = useState(false);

  return (
    <div className={styles.Home}>
      <Sidebar open={menu} set={setMenu} />
      <div className={styles.Home__top}>
        {authService.currentUser ? (
          <Link to="/dashboard">
            <button className={classNames(styles.signIn, "btn")}>
              Dashboard
            </button>
          </Link>
        ) : (
          <Link to="/auth">
            <button className={classNames(styles.signIn, "btn")}>
              Sign In
            </button>
          </Link>
        )}
        <div
          className={styles.menutoggle}
          onClick={() => {
            setMenu(true);
          }}
        >
          <FontAwesomeIcon icon={faBars} />
        </div>
      </div>
      <Landing />
      <Information />
      <Tutoring />
      <Features />
      <Footer />
    </div>
  );
}

export default Home;
