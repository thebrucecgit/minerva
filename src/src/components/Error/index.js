import React from "react";
import classNames from "classnames";
import { Link, useHistory } from "react-router-dom";

import styles from "./styles.module.scss";

import { ReactComponent as ServerDown } from "./undraw_server_down.svg";

const Error = ({ error }) => {
  const history = useHistory();
  const errorOccurred = new Date();

  return (
    <div className={classNames("container")}>
      <div className={styles.ErrorMessage}>
        <h1>Oops! Something went wrong. </h1>
        <p className="error">{error.message}</p>
        <p>
          It's okay.{" "}
          <a
            href={`mailto:tutoring@minervaeducation.co.nz?subject=Website Error at ${
              history.location.pathname
            }&body=I came across the error with the message "${
              error.message
            }" at ${errorOccurred.toTimeString()}. %0a%0aI was [explain what you were doing...]`}
            target="_blank"
            rel="noopener noreferrer"
          >
            Please notify the Minerva administrators
          </a>
          .
        </p>
        <button className="btn" onClick={history.goBack}>
          Go Back
        </button>
        <p>
          <Link to="/dashboard">Return to Dashboard.</Link>
        </p>
        <ServerDown className={styles.icon} />
      </div>
    </div>
  );
};

export default Error;
