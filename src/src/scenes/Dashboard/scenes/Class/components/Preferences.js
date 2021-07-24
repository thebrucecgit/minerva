import React from "react";

import styles from "../../../class.module.scss";

const Preferences = ({ onSubmit, onChange, update }) => {
  return (
    <div className={styles.padding}>
      <h2>Preferences</h2>
      <form onSubmit={onSubmit}>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="publicClass"
            id="publicClass"
            checked={update.publicClass}
            onChange={onChange}
          />
          <label htmlFor="publicClass">
            Public class
            <div className="small">
              If checked, anyone can view and request to join this class
            </div>
          </label>
        </div>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="online"
            id="online"
            checked={update.online}
            onChange={onChange}
          />
          <label htmlFor="online">
            Online class
            <div className="small">
              If checked, this class occurs online. Otherwise, this class occurs
              in-person at the set location.
            </div>
          </label>
        </div>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="enableChat"
            id="enableChat"
            checked={update.enableChat}
            onChange={onChange}
          />
          <label htmlFor="enableChat">Enable chat</label>
        </div>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="studentAgreeSessions"
            id="studentAgreeSessions"
            checked={update.studentAgreeSessions}
            onChange={onChange}
          />
          <label htmlFor="studentAgreeSessions">
            Session requests
            <div className="small">
              Tutors and tutees will need to accept a new session request before
              the session is confirmed.
            </div>
          </label>
        </div>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="studentInstantiation"
            id="studentInstantiation"
            checked={update.studentInstantiation}
            onChange={onChange}
          />
          <label htmlFor="studentInstantiation">
            Allow tutee to instantiate sessions
            <div className="small">
              Tutees will be allowed to set a time and create or request a new
              session.
            </div>
          </label>
        </div>
        <button className="btn">Save</button>
      </form>
    </div>
  );
};

export default Preferences;
