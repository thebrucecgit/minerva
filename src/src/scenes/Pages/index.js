import { Switch, Route } from "react-router-dom";

import PrivacyPolicy from "./scenes/PrivacyPolicy";
import PageNotFound from "../PageNotFound";

import Navbar from "../../components/Navbar";
import Footer from "../../components/Footer";

import "./styles.scss";
import styles from "./styles.module.scss";

function Pages() {
  return (
    <div className={styles.Pages}>
      <Navbar />
      <Switch>
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
