import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import gql from "graphql-tag";
import classNames from "classnames";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { format, addMinutes } from "date-fns";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";
import Loader from "../../../../components/Loader";

import EditButton from "../../components/EditButton";
import Menu from "../../components/Menu";
import Tutors from "../../components/Tutors";
import Map from "../../components/Map";
import Modal from "../../../../components/Modal";
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

let toastId = null;

const Session = ({ currentUser }) => {
  const { id } = useParams();

  const [sessionInfo, setSessionInfo] = useState({});
  const [update, setUpdate] = useState({
    tutors: "",
    location: "",
    notes: "",
    preferences: "",
  });

  const [disabled, setDisabled] = useState({
    tutors: true,
    location: true,
    notes: true,
    preferences: true,
  });

  const [editEnabled, setEditEnabled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const { loading, error, data } = useQuery(GET_SESSION, {
    variables: { id },
  });

  const [updateSession] = useMutation(UPDATE_SESSION);

  const saveInfo = async (name) => {
    try {
      toastId = toast("Updating session...", { autoClose: false });

      const variables = {
        id,
        [name]: update[name],
      };

      if (name === "notes") variables.notes = JSON.stringify(update.notes);
      else if (name === "tutors")
        variables.tutors = update.tutors.map((tutor) => tutor._id);

      setUpdate((st) => ({
        ...st,
        [name]: "",
      }));

      setSessionInfo((st) => ({
        ...st,
        [name]: update[name],
      }));

      await updateSession({ variables });

      toast.update(toastId, {
        render: "Successfully updated",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
    } catch (e) {
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
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
    setUpdate((st) => ({ ...st, notes: editor.getContents() }));
  };

  const onInfoChange = (e) => {
    e.persist();
    setUpdate((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const toggleDisabled = async (name) => {
    if (disabled[name])
      setUpdate((st) => ({
        ...st,
        [name]: sessionInfo[name],
      }));
    else saveInfo(name);
    setDisabled((st) => {
      return {
        ...st,
        [name]: !st[name],
      };
    });
  };

  const cancelUpdate = (name) => {
    setUpdate((st) => ({
      ...st,
      [name]: "",
    }));
    setDisabled((st) => ({
      ...st,
      [name]: true,
    }));
  };

  const Edit = EditButton({
    disabled,
    toggleDisabled,
    cancelUpdate,
    editEnabled,
  });

  const rootClick = () => {
    setMenuOpen(false);
  };

  const closeModal = () => {
    setModalOpen(false);
  };

  if (error) toast(error.message, { type: toast.TYPE.ERROR });
  if (loading || !sessionInfo.time) return <Loader />;

  return (
    <div className={styles.Class} onClick={rootClick}>
      <div>
        <h1>{format(sessionInfo.time, "EEEE d MMMM, yyyy")}</h1>
        <p className={styles.padding}>
          <Link to={`/dashboard/classes/${sessionInfo.class._id}`}>
            {sessionInfo.class.name}
          </Link>
        </p>
        <div className={styles.flex}>
          <p className={styles.date}>
            {`${format(sessionInfo.time, "h:mm aa")} - ${format(
              addMinutes(sessionInfo.time, sessionInfo.length),
              "h:mm aa"
            )}`}
          </p>
          <div className={styles.edit}>
            <Menu
              menuOpen={menuOpen}
              setMenuOpen={setMenuOpen}
              setModalOpen={setModalOpen}
              editEnabled={editEnabled}
              setEditEnabled={setEditEnabled}
              toggleDisabled={toggleDisabled}
            />
          </div>
        </div>
        <Edit type="location" />
        <div className={styles.section}>
          <Map
            location={sessionInfo.location}
            disabled={disabled.location}
            update={update.location}
            setUpdate={setUpdate}
          />
        </div>

        <h2 className={styles.padding}>What we did</h2>
        <ReactQuill
          theme={disabled.notes ? null : "snow"}
          readOnly={disabled.notes}
          className={classNames({ disabled: disabled.notes })}
          value={disabled.notes ? sessionInfo.notes : update.notes}
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
          update={update.tutors}
          setUpdate={setUpdate}
        />
      </div>
      <Modal open={modalOpen} onClose={closeModal}>
        <div className={styles.padding}>
          <h2>Preferences</h2>
        </div>
      </Modal>
    </div>
  );
};

export default Session;
