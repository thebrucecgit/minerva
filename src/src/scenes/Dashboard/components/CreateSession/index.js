import React from "react";
import DatePicker from "react-datepicker";

import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useHistory } from "react-router-dom";
import { loader } from "graphql.macro";
import { toast } from "react-toastify";
import "react-datepicker/dist/react-datepicker.css";
import Modal from "components/Modal";
import styled from "styled-components";
import { LoadScript, Autocomplete } from "@react-google-maps/api";
// import styles from "../../../class.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const CREATE_SESSION = loader("./graphql/CreateSession.gql");

const StyledCreateSession = styled.div`
  margin: 1rem;
  h2 {
    margin-bottom: 1rem;
  }
`;

export default function CreateSession({ isOpen, close, users }) {
  const history = useHistory();

  const [autoComplete, setAutoComplete] = useState(null);
  const [error, setError] = useState("");
  const [name, setName] = useState("");
  const [time, setTime] = useState(new Date());
  const [length, setLength] = useState("60");
  const [online, setOnline] = useState(false);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState({});

  const [createSession] = useMutation(CREATE_SESSION);

  const newSession = async () => {
    let toastId;
    try {
      setLoading(true);
      toastId = toast("Creating session...", { autoClose: false });
      const { data } = await createSession({
        variables: {
          name,
          tutors: users
            .filter((u) => u.tutor.status === "COMPLETE")
            .map((u) => u._id),
          tutees: users
            .filter((u) => u.tutor.status !== "COMPLETE")
            .map((u) => u._id),
          startTime: time,
          length: parseInt(length),
          online,
          location,
        },
      });
      toast.update(toastId, {
        render: "Successfully created session",
        type: toast.TYPE.SUCCESS,
        autoClose: 3000,
      });
      setLoading(false);
      history.push(`/dashboard/sessions/${data.createSession._id}`);
    } catch (e) {
      setLoading(false);
      toast.dismiss(toastId);
      setError(e.message);
    }
  };

  const onLocationChange = (e) => {
    e.persist();
    setLocation((st) => ({
      ...st.location,
      address: e.target.value,
    }));
  };

  const onPlaceChanged = () => {
    if (autoComplete !== null) {
      const place = autoComplete.getPlace();

      const coords = {
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
      };

      setLocation((st) => ({
        address: `${place.name}, ${place.formatted_address}`,
        coords,
      }));
    } else {
      console.log("Autocomplete is not loaded yet!");
    }
  };

  return (
    <Modal open={isOpen} onClose={close}>
      <StyledCreateSession>
        <h2>Create Session</h2>

        <label htmlFor="name">Subject for session: </label>
        <input
          type="text"
          name="name"
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <label htmlFor="tutors">Participants:</label>
        <p>
          {users
            .map(
              (u) => u.name + (u.tutor.status === "COMPLETE" ? " (Tutor)" : "")
            )
            .join(", ")}
        </p>

        <label htmlFor="time">Time: </label>
        <DatePicker
          selected={time}
          onChange={setTime}
          showTimeSelect
          timeFormat="h:mm aa"
          timeIntervals={15}
          timeCaption="Time"
          dateFormat="d MMMM yyyy h:mm aa"
        />
        <label htmlFor="length">Length: </label>
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

        <div className="field checkbox">
          <input
            type="checkbox"
            name="online"
            id="online"
            checked={online}
            onChange={(e) => setOnline(e.target.checked)}
          />
          <label htmlFor="online">
            Online session
            <div className="small">This session will occur online</div>
          </label>
        </div>

        <div className="field">
          <label htmlFor="location">Location:</label>
          <LoadScript
            libraries={["places"]}
            googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY}
          >
            <Autocomplete
              onLoad={(instance) => {
                setAutoComplete(instance);
              }}
              onPlaceChanged={onPlaceChanged}
              bounds={
                // Bounds around New Zealand
                {
                  east: 179.83,
                  north: -34.09,
                  south: -47.37,
                  west: 164.58,
                }
              }
            >
              <input
                type="text"
                // className={styles.MapInput}
                disabled={online}
                value={location.address ?? ""}
                onChange={onLocationChange}
              />
            </Autocomplete>
          </LoadScript>
        </div>

        {error && <p className="error">{error}</p>}
        <button className="btn" onClick={newSession}>
          Request Session{" "}
          {loading && <FontAwesomeIcon icon={faCircleNotch} spin />}
        </button>
      </StyledCreateSession>
    </Modal>
  );
}
