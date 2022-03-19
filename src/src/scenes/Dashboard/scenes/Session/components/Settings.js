import React from "react";

import styles from "../../../class.module.scss";

const Settings = ({ onSubmit, onChange, update }) => {
  return (
    <div className={styles.padding}>
      <h2>Settings</h2>
      <form onSubmit={onSubmit}>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="online"
            id="online"
            checked={update.online}
            onChange={onChange}
          />
          <label htmlFor="online">
            Online session
            <div className="small">This session occurs online</div>
          </label>
        </div>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="studentEditNotes"
            id="studentEditNotes"
            checked={update.studentEditNotes}
            onChange={onChange}
          />
          <label htmlFor="studentEditNotes">Allow tutees to edit notes</label>
        </div>
        {/* <div className="field checkbox">
          <input
            type="checkbox"
            name="syncTutorsWithClass"
            id="syncTutorsWithClass"
            checked={update.syncTutorsWithClass}
            onChange={onChange}
          />
          <label htmlFor="syncTutorsWithClass">
            Synchronise tutors with class
            <div className="small">
              If checked, changes of tutors in the parent class will be
              reflected in this session. Otherwise, tutors in this session may
              be edited to something different to the class.
            </div>
          </label>
        </div>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="syncTuteesWithClass"
            id="syncTuteesWithClass"
            checked={update.syncTuteesWithClass}
            onChange={onChange}
          />
          <label htmlFor="syncTuteesWithClass">
            Synchronise tutees with class
            <div className="small">
              If checked, changes of tutees in the parent class will be
              reflected in this session. Otherwise, tutees in this session may
              be edited to something different to the class.
            </div>
          </label>
        </div> */}
        <button className="btn">Save</button>
      </form>
    </div>
  );
};

export default Settings;
