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
            name="studentEditNotes"
            id="studentEditNotes"
            checked={update.studentEditNotes}
            onChange={onChange}
          />
          <label htmlFor="studentEditNotes">Allow tutees to edit notes</label>
        </div>
        <div className="field checkbox">
          <input
            type="checkbox"
            name="syncTutorsWithClass"
            id="syncTutorsWithClass"
            checked={update.syncTutorsWithClass}
            onChange={onChange}
          />
          <label htmlFor="syncTutorsWithClass">
            Tutors of this session to be synchronised with the parent class
            <div className="small">
              If checked, changes of tutors in this session will be reflected in
              the parent class and vice versa
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
            Tutees of this session to be synchronised with the parent class
            <div className="small">
              If checked, changes of tutees in this session will be reflected in
              the parent class and vice versa
            </div>
          </label>
        </div>
        <button className="btn">Save</button>
      </form>
    </div>
  );
};

export default Settings;
