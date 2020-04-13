import React from "react";
import classNames from "classnames";

import { GoogleLogin } from "react-google-login";
import StatusSymbol from "../StatusSymbol";

import styles from "../../styles.module.scss";

const SignIn = ({
  sectionStatus,
  sectionClosed,
  errors,
  onNext,
  onGoogleSignIn,
  onGoogleFailed,
}) => {
  return (
    <section>
      <div className={styles.header}>
        <h3>Sign In</h3>
        <StatusSymbol state={sectionStatus} />
      </div>
      <div
        className={classNames(styles.body, {
          [styles.closed]: sectionClosed,
        })}
      >
        <div className={classNames(styles.content, styles.strategies)}>
          {errors.signIn && <p className={styles.invalid}>{errors.signIn}</p>}
          <GoogleLogin
            clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
            onSuccess={onGoogleSignIn}
            onFailure={onGoogleFailed}
            cookiePolicy="single_host_origin"
          />{" "}
          or <button onClick={onNext}>Sign in with Email</button>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
