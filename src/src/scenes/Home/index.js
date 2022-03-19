import { Link } from "react-router-dom";
import classNames from "classnames";

import Landing from "./components/Landing";

import styles from "./styles.module.scss";

function Home({ authService }) {
  return (
    <div className={styles.Home}>
      <div className={styles.Home__top}>
        {authService.currentUser ? (
          <>
            <Link to="/auth/logout" className={styles.logout}>
              Logout
            </Link>
            <Link to="/dashboard">
              <button className={classNames(styles.signIn, "btn")}>
                Dashboard
              </button>
            </Link>
          </>
        ) : (
          <Link to="/auth">
            <button className={classNames(styles.signIn, "btn")}>
              Sign In
            </button>
          </Link>
        )}
      </div>
      <Landing />
    </div>
  );
}

export default Home;
