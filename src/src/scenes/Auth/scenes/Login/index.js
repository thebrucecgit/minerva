import React, { useState } from "react";
import { useHistory, Link } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";
import { GoogleLogin } from "react-google-login";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

const Login = ({ login, currentUser }) => {
  const history = useHistory();

  useAuth(currentUser?.user?.registrationStatus, ["login"]);

  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  const onFieldChange = (e) => {
    e.persist();
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onGoogleSignIn = async ({ tokenId }) => {
    try {
      await login(tokenId);
      history.replace("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  };

  const onGoogleFailed = (err) => {
    console.error(err);
    setError(err.message);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { email, password } = fields;
      await login(email, password);
      setLoading(false);
      history.replace("/dashboard");
    } catch (e) {
      setLoading(false);
      setError(e.message);
    }
  };

  return (
    <div className={styles.Login}>
      {error && <p className="error">{error}</p>}
      <div>
        <h1>Sign In</h1>
        <p>
          <Link to="/auth/passwordreset">Forgot Password</Link>
        </p>
        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email: </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email || ""}
              onChange={onFieldChange}
            />
          </div>
          <div className="field">
            <label htmlFor="password">Password: </label>
            <input
              name="password"
              type="password"
              autoComplete="current-password"
              value={fields.password || ""}
              onChange={onFieldChange}
            />
          </div>
          <button className="btn">
            Sign In {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
          </button>
        </form>
      </div>
      <p> Or </p>
      <div>
        <GoogleLogin
          clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
          onSuccess={onGoogleSignIn}
          onFailure={onGoogleFailed}
          cookiePolicy="single_host_origin"
        />
      </div>
    </div>
  );
};

export default Login;
