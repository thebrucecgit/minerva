import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { GoogleLogin } from "react-google-login";

function Login({ login, currentUser }) {
  const history = useHistory();

  useEffect(() => {
    if (currentUser && currentUser.registered) history.replace("/dashboard");
  }, [currentUser, history]);

  const [error, setError] = useState("");
  const [fields, setFields] = useState({});

  const onFieldChange = (e) => {
    e.persist();
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onGoogleSignIn = async ({ tokenId }) => {
    try {
      const userInfo = await login(tokenId);
      if (!userInfo.registered) history.replace("/signup");
      else history.replace("/dashboard");
    } catch (e) {
      setError(e);
    }
  };

  const onGoogleFailed = (err) => {
    console.error(err);
    setError(err);
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      const { email, password } = fields;
      await login(email, password);
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="Login">
      {error && <div className="Login--error">{error}</div>}
      <GoogleLogin
        clientId={process.env.REACT_APP_GOOGLE_CLIENT_ID}
        onSuccess={onGoogleSignIn}
        onFailure={onGoogleFailed}
        cookiePolicy="single_host_origin"
      />
      <form onSubmit={onSubmit}>
        <input
          name="email"
          type="email"
          value={fields.email || ""}
          onChange={onFieldChange}
        />
        <input
          name="password"
          type="password"
          value={fields.password || ""}
          onChange={onFieldChange}
        />
        <button>Login</button>
      </form>
    </div>
  );
}

export default Login;
