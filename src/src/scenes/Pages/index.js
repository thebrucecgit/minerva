import React, { useState } from "react";
import { Switch, Route } from "react-router-dom";

import About from "./scenes/About";
import Services from "./scenes/Services";
import Extras from "./scenes/Extras";
import Academic from "./scenes/Academic";
import Tutors from "./scenes/Tutors";
import PrivacyPolicy from "./scenes/PrivacyPolicy";
import PageNotFound from "../PageNotFound";

import Navbar from "../../components/Navbar";
import Sidebar from "../../components/Sidebar";
import Footer from "../../components/Footer";

import "./styles.scss";
import styles from "./styles.module.scss";

function Pages() {
  const [menu, setMenu] = useState(false);

  return (
    <div className={styles.Pages}>
      <Navbar set={setMenu} />
      <Sidebar open={menu} set={setMenu} />
      <Switch>
        <Route exact path="/about-us">
          <About />
        </Route>
        <Route exact path="/services">
          <Services />
        </Route>
        <Route exact path="/services/extra-curriculars">
          <Extras />;
        </Route>
        <Route exact path="/services/academic-studies">
          <Academic />
        </Route>
        <Route exact path="/tutors">
          <Tutors />
        </Route>
        <Route exact path="/privacy-policy">
          <PrivacyPolicy />
        </Route>
        <Route path="/">
          <PageNotFound />
        </Route>
      </Switch>
      <Footer />
    </div>
  );
}

export default Pages;
