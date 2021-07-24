import React from "react";
import DatePicker from "react-datepicker";
import classNames from "classnames";

import "react-datepicker/dist/react-datepicker.css";
import styles from "../../../class.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const InstantiateSession = ({
  time,
  setTime,
  length,
  setLength,
  newSession,
  instantiationError,
  studentAgreeSessions,
  loading,
}) => {
  return (
    <>
      <DatePicker
        selected={time}
        onChange={setTime}
        showTimeSelect
        timeFormat="h:mm aa"
        timeIntervals={15}
        timeCaption="Time"
        dateFormat="d MMMM yyyy h:mm aa"
      />
      <select name="length" value={length} onChange={setLength}>
        <option value="30">30 Minutes</option>
        <option value="45">45 Minutes</option>
        <option value="60">60 Minutes</option>
        <option value="90">90 Minutes</option>
        <option value="120">120 Minutes</option>
      </select>
      {instantiationError && <p className="error">{instantiationError}</p>}
      <button
        className={classNames("btn", styles.session)}
        onClick={newSession}
      >
        {studentAgreeSessions ? "Request Session" : "New Session"}{" "}
        {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
      </button>
    </>
  );
};

export default InstantiateSession;
