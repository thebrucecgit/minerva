import React, { useState } from "react";
import { Link } from "react-router-dom";

const PasswordReset = ({ resetPassword, updatePassword }) => {
  const [fields, setFields] = useState({});
  const [reset, setReset] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const onFieldChange = (e) => {
    e.persist();
    setFields((f) => ({ ...f, [e.target.name]: e.target.value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (reset) {
      try {
        if (fields?.newPassword?.length < 8)
          throw new Error(
            "Password needs to have a minimum of eight characters"
          );
        await updatePassword({
          ...fields,
          passwordResetCode: parseInt(fields.passwordResetCode),
        });
        setSuccess(true);
      } catch (e) {
        setError(e.message);
      }
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
              <button className="btn">Go to Dashboard</button>
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
                value={fields.email ?? ""}
                disabled={reset}
                onChange={onFieldChange}
              />
            </div>
            {reset && (
              <>
                <div className="field">
                  <label htmlFor="resetCode">
                    Enter a numeric code sent to <b>{fields.email}</b>:
                  </label>
                  <input
                    type="number"
                    id="resetCode"
                    name="passwordResetCode"
                    value={fields.passwordResetCode ?? ""}
                    onChange={onFieldChange}
                  />
                  <p className="small">
                    Email should arrive within 10 minutes (check spam folder) if
                    the account exists
                  </p>
                </div>
                <div className="field">
                  <label htmlFor="password">New password:</label>
                  <input
                    name="newPassword"
                    type="password"
                    autoComplete="new-password"
                    value={fields.newPassword ?? ""}
                    onChange={onFieldChange}
                  />
                </div>
              </>
            )}
            {error && <p className="error">{error}</p>}
            <button className="btn">
              {reset ? "Reset Password" : "Send Reset Email"}
            </button>
          </>
        )}
      </form>
    </div>
  );
};

export default PasswordReset;
