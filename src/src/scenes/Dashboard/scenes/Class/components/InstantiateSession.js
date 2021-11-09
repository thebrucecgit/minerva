import React from "react";
import DatePicker from "react-datepicker";
import classNames from "classnames";
import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useParams, useHistory } from "react-router-dom";
import { loader } from "graphql.macro";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import styles from "../../../class.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const INSTANTIATE_SESSION = loader("../graphql/InstantiateSession.gql");

const InstantiateSession = ({ studentAgreeSessions }) => {
  const history = useHistory();

  const [instantiationError, setInstantiationError] = useState("");

  const [time, setTime] = useState(new Date());
  const [length, setLength] = useState("60");
  const [loading, setLoading] = useState(false);

  const [instantiateSession] = useMutation(INSTANTIATE_SESSION);

  const { id } = useParams();
  const newSession = async () => {
    let toastId;
    try {
      setLoading(true);
      toastId = toast("Instantiating session...", { autoClose: false });
      const { data } = await instantiateSession({
        variables: {
          classId: id,
          startTime: time,
          length: parseInt(length),
        },
      });
      toast.update(toastId, {
        render: "Successfully instantiated session",
        type: toast.TYPE.SUCCESS,
        autoClose: 3000,
      });
      setLoading(false);
      history.push(`/dashboard/sessions/${data.instantiateSession._id}`);
    } catch (e) {
      setLoading(false);
      toast.dismiss(toastId);
      setInstantiationError(e.message);
    }
  };

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
      <select
        name="length"
        value={length}
        onChange={(e) => setLength(e.target.value)}
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
        {studentAgreeSessions ? "Request Session" : "New Session"}{" "}
        {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
      </button>
    </>
  );
};

export default InstantiateSession;
