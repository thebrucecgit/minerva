import React from "react";
import classNames from "classnames";

import { GoogleLogin } from "@react-oauth/google";
import StatusSymbol from "../StatusSymbol";

import styles from "../../styles.module.scss";

const SignIn = ({
  sectionStatus,
  sectionClosed,
  errors,
  onNext,
  onGoogleSignIn,
}) => {
  return (
    <section>
      <div className={styles.header}>
        <h3>Sign Up</h3>
        <StatusSymbol state={sectionStatus} />
      </div>
      <div
        className={classNames(styles.body, {
          [styles.closed]: sectionClosed,
        })}
      >
        <div className={classNames(styles.content, styles.strategies)}>
          <p>Select your method:</p>
          {errors.signIn && <p className={styles.invalid}>{errors.signIn}</p>}
          <button className="btn" onClick={onNext}>
            Sign up with email
          </button>
          <div>
            <GoogleLogin onSuccess={onGoogleSignIn} text="signup_with" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default SignIn;
