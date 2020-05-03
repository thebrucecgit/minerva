import React, { useState } from "react";
import { Link, useParams, useHistory } from "react-router-dom";
import classNames from "classnames";
import { useMutation } from "@apollo/react-hooks";
import gql from "graphql-tag";
import { format } from "date-fns";
import DatePicker from "react-datepicker";

import Tutors from "../../../components/Tutors/";

import "react-datepicker/dist/react-datepicker.css";
import styles from "../../../class.module.scss";

const INSTANTIATE_SESSION = gql`
  mutation InstantiateSession($classId: ID!, $time: Date!, $length: Int!) {
    instantiateSession(classId: $classId, time: $time, length: $length) {
      _id
    }
  }
`;

const Column = (props) => {
  const history = useHistory();

  const [instantiationError, setInstantiationError] = useState("");

  const [sessionTime, setSessionTime] = useState(new Date());
  const [sessionLength, setSessionLength] = useState("60");

  const [instantiateSession] = useMutation(INSTANTIATE_SESSION);

  const { id } = useParams();

  const newSession = async () => {
    const { data, error } = await instantiateSession({
      variables: {
        classId: id,
        time: sessionTime,
        length: parseInt(sessionLength),
      },
    });
    if (error) setInstantiationError(error.message);
    else history.push(`/dashboard/sessions/${data.instantiateSession._id}`);
  };

  const { Edit } = props;

  return (
    <div className={styles.column}>
      <Tutors
        Edit={props.Edit}
        tutorsDisabled={props.disabled.tutors}
        tutors={props.classInfo.tutors}
        setInfo={props.setClassInfo}
      />
      <div className={styles.flex}>
        <h2>Sessions </h2>
        <Edit type="sessions" />
      </div>
      {props.classInfo.sessions.map((session) => (
        <Link
          to={`/dashboard/sessions/${session._id}`}
          key={session._id}
          className={styles.section}
        >
          <h3>{format(session.time, "d MMMM, yyyy")}</h3>
        </Link>
      ))}
      {!props.disabled.sessions && (
        <>
          <DatePicker
            selected={sessionTime}
            onChange={setSessionTime}
            showTimeSelect
            timeFormat="h:mm aa"
            timeIntervals={15}
            timeCaption="Time"
            dateFormat="d MMMM, yyyy h:mm aa"
          />
          <select
            name="length"
            value={sessionLength}
            onChange={(e) => setSessionLength(e.target.value)}
          >
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
            New Session
          </button>
        </>
      )}
    </div>
  );
};

export default Column;
