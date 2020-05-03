import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import gql from "graphql-tag";
import classNames from "classnames";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { format, addMinutes } from "date-fns";
import ReactQuill from "react-quill";

import EditButton from "../../components/EditButton";
import Tutors from "../../components/Tutors";
import Map from "../../components/Map";
import reactQuillModules from "../reactQuillModules";

import styles from "../../class.module.scss";
import "react-quill/dist/quill.snow.css";

const GET_SESSION = gql`
  query GetSession($id: ID!) {
    getSession(id: $id) {
      class {
        _id
        name
      }
      tutors {
        _id
        pfp
        name
      }
      location {
        address
        coords {
          lat
          lng
        }
      }
      price
      time
      length
      notes
    }
  }
`;

const UPDATE_SESSION = gql`
  mutation UpdateSession(
    $id: ID!
    $notes: String
    $location: LocationIn
    $tutors: [ID!]
  ) {
    updateSession(
      id: $id
      notes: $notes
      location: $location
      tutors: $tutors
    ) {
      _id
      notes
      location {
        address
        coords {
          lat
          lng
        }
      }
      tutors {
        _id
        name
        pfp
      }
    }
  }
`;

const Session = ({ currentUser }) => {
  const { id } = useParams();

  const [sessionInfo, setSessionInfo] = useState({});
  const [disabled, setDisabled] = useState({
    tutors: true,
    location: true,
    notes: true,
  });

  const [updateError, setUpdateError] = useState("");

  const { loading, error, data } = useQuery(GET_SESSION, {
    variables: { id },
  });

  const [updateSession, { loading: updateLoading }] = useMutation(
    UPDATE_SESSION
  );

  const saveInfo = async () => {
    try {
      const info = await updateSession({
        variables: {
          notes: JSON.stringify(sessionInfo.notes),
          location: sessionInfo.location,
          tutors: sessionInfo.tutors.map((tutor) => tutor._id),
          id,
        },
      });
      setSessionInfo((st) => ({
        ...st,
        ...info.updateSession,
      }));
    } catch (e) {
      setUpdateError(e.message);
    }
  };

  useEffect(() => {
    if (data) {
      setSessionInfo((st) => ({
        ...st,
        ...data.getSession,
        notes: JSON.parse(data.getSession.notes),
      }));
    }
  }, [data]);

  const onNotesChange = (content, delta, source, editor) => {
    setSessionInfo((st) => ({ ...st, notes: editor.getContents() }));
  };

  const onInfoChange = (e) => {
    e.persist();
    setSessionInfo((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleDisabled = async (name) => {
    setDisabled((st) => {
      // if saving
      if (!st[name]) saveInfo();
      return {
        ...st,
        [name]: !st[name],
      };
    });
  };

  const Edit = EditButton({ currentUser, disabled, toggleDisabled });

  if (loading || !sessionInfo.time) return null;
  if (error) return error.message;

  return (
    <div className={styles.Class}>
      {updateLoading && <p>Updating...</p>}
      {updateError && <p className="error">{updateError}</p>}
      <div>
        <h1>{format(sessionInfo.time, "EEEE d MMMM, yyyy")}</h1>
        <p className={styles.padding}>
          <Link to={`/dashboard/classes/${sessionInfo.class._id}`}>
            {sessionInfo.class.name}
          </Link>
        </p>
        <p className={styles.date}>
          {`${format(sessionInfo.time, "h:mm aa")} - ${format(
            addMinutes(sessionInfo.time, sessionInfo.length),
            "h:mm aa"
          )}`}
        </p>
        <Edit type="location" />
        <Map
          location={sessionInfo.location}
          disabled={disabled.location}
          setInfo={setSessionInfo}
        />

        <h2 className={styles.padding}>What we did</h2>
        <ReactQuill
          theme={disabled.notes ? null : "snow"}
          readOnly={disabled.notes}
          className={classNames({ disabled: disabled.notes })}
          value={sessionInfo.notes}
          onChange={onNotesChange}
          modules={reactQuillModules}
        />
        <Edit type="notes" />
      </div>
      <div className={styles.column}>
        <Tutors
          Edit={Edit}
          tutorsDisabled={disabled.tutors}
          tutors={sessionInfo.tutors}
          setInfo={setSessionInfo}
        />
      </div>
    </div>
  );
};

export default Session;
