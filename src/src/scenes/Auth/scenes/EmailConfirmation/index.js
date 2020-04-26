import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck } from "@fortawesome/free-solid-svg-icons";

const EmailConfirmation = ({ confirmUserEmail, location }) => {
  const [success, setSuccess] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const queries = new URLSearchParams(location.search);
        const id = queries.get("id");
        if (!id) throw new Error("There is no ID");
        await confirmUserEmail(id);
        setSuccess(true);
      } catch (e) {
        setSuccess(false);
        setError(e.message);
      }
    })();
    // eslint-disable-next-line
  }, [location.search]);

  return (
    <div>
      <h1>Confirmation of User Email</h1>

      {error && <p className="error">{error}</p>}
      {success === null && <h3>Loading...</h3>}
      {success && (
        <>
          <h3>
            Email has been successfully confirmed{" "}
            <FontAwesomeIcon icon={faCheck} />
          </h3>
          <Link to="/dashboard">Go to Dashboard</Link>
        </>
      )}
    </div>
  );
};

export default EmailConfirmation;
