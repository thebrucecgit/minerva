import React, { useState } from "react";
import { Link } from "react-router-dom";

const PasswordReset = ({ resetPassword, updatePassword }) => {
  const [fields, setFields] = useState({});
  const [reset, setReset] = useState(false);
  const [success, setSuccess] = useState(false);

  const onFieldChange = (e) => {
    e.persist();
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (reset) {
      // validation
      await updatePassword({
        ...fields,
        passwordResetCode: parseInt(fields.passwordResetCode),
      });
      setSuccess(true);
    } else {
      await resetPassword(fields.email);
      setReset(true);
    }
  };

  return (
    <div>
      <h1>Password Reset</h1>
      <form onSubmit={onSubmit}>
        {success ? (
          <>
            <p>You have successfully updated your password.</p>
            <Link to="/dashboard">
              <button>Go to Dashboard</button>
            </Link>
          </>
        ) : (
          <>
            <div className="field">
              <label htmlFor="email">Email: </label>
              <input
                name="email"
                type="email"
                autoComplete="email"
                value={fields.email}
                disabled={reset}
                onChange={onFieldChange}
              />
            </div>
            <div style={{ display: reset ? "inline" : "none" }}>
              <div className="field">
                <label htmlFor="resetCode">
                  Enter a numeric code sent to <b>{fields.email}</b>:
                </label>
                <input
                  type="number"
                  id="resetCode"
                  name="passwordResetCode"
                  value={fields.passwordResetCode}
                  onChange={onFieldChange}
                />
                <p className="small">
                  Email should arrive within 10 minutes (check spam folder)
                </p>
              </div>
              <div className="field">
                <label htmlFor="password">New password:</label>
                <input
                  name="newPassword"
                  type="password"
                  autoComplete="new-password"
                  value={fields.newPassword}
                  onChange={onFieldChange}
                />
              </div>
            </div>
            <button>{reset ? "Reset Password" : "Send Reset Email"}</button>
          </>
        )}
      </form>
    </div>
  );
};

export default PasswordReset;
