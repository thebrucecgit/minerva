import { useState } from "react";
import { Link } from "react-router-dom";
import { GoogleOAuthProvider, GoogleLogin } from "@react-oauth/google";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

const Login = ({ login }) => {
  const [error, setError] = useState("");
  const [fields, setFields] = useState({});
  const [loading, setLoading] = useState(false);

  const onFieldChange = (e) => {
    e.persist();
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onGoogleSignIn = async ({ credential }) => {
    try {
      await login(credential);
    } catch (e) {
      setError(e.message);
    }
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const { email, password } = fields;
      if (!email || !password) throw new Error("Missing email or password");
      await login(email, password);
      setLoading(false);
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

        <form onSubmit={onSubmit}>
          <div className="field">
            <label htmlFor="email">Email: </label>
            <input
              name="email"
              type="email"
              autoComplete="email"
              value={fields.email || ""}
              onChange={onFieldChange}
              required
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
              required
            />
            <Link to="/auth/passwordreset" className="link">
              Forgot Password
            </Link>
          </div>
          <button className="btn">
            Sign In {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
          </button>
        </form>
      </div>
      <p> Or </p>
      <GoogleOAuthProvider clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}>
        <GoogleLogin onSuccess={onGoogleSignIn} />
      </GoogleOAuthProvider>
    </div>
  );
};

export default Login;
