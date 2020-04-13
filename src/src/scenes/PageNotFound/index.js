import React from "react";
import { Link } from "react-router-dom";

import { ReactComponent as Lost } from "./images/undraw_lost_bqr2.svg";

function PageNotFound() {
  return (
    <div>
      <div className="header">
        <h1>404 Page Not Found</h1>
      </div>
      <div className="container">
        <p>
          The page you requested for could not be found – sorry.{" "}
          <Link to="/">Return to home</Link>
        </p>
        <Lost className="full-page" />
      </div>
    </div>
  );
}

export default PageNotFound;
