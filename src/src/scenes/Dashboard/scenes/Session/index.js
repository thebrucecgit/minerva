import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { loader } from "graphql.macro";
import classNames from "classnames";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { format } from "date-fns";
import ReactQuill from "react-quill";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";
import Loader from "../../../../components/Loader";

import Attendance from "./components/Attendance";
import EditButton from "../../components/EditButton";
import Menu from "../../components/Menu";
import Tutors from "../../components/Tutors";
import Map from "../../components/Map";
import Modal from "../../../../components/Modal";
import reactQuillModules from "../reactQuillModules";

import useMenu from "../../hooks/useMenu";
import useEdits from "../../hooks/useEdits";
import useModal from "../../hooks/useModal";

import styles from "../../class.module.scss";
import "react-quill/dist/quill.snow.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenAlt,
  faUserCog,
  faUnlock,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const GET_SESSION = loader("./graphql/GetSession.gql");
const UPDATE_SESSION = loader("./graphql/UpdateSession.gql");
const DELETE_SESSION = loader("./graphql/DeleteSession.gql");

const toastId = {};

const Session = ({ currentUser }) => {
  const history = useHistory();
  const { id } = useParams();

  const [sessionInfo, setSessionInfo] = useState({});
  const [update, setUpdate] = useState({
    tutors: "",
    location: "",
    notes: "",
    settings: "",
  });

  const [disabled, setDisabled] = useState({
    tutors: true,
    location: true,
    notes: true,
    settings: true,
  });

  const [editEnabled, setEditEnabled] = useState(false);
  const [rootClick, menuBind] = useMenu(false);

  const { loading, error, data } = useQuery(GET_SESSION, {
    variables: { id },
  });

  const [updateSession] = useMutation(UPDATE_SESSION);
  const [deleteSessionReq] = useMutation(DELETE_SESSION);

  const saveInfo = async (name, { resetUpdate = true } = {}) => {
    try {
      toastId.update = toast("Updating session...", { autoClose: false });

      setDisabled((st) => ({
        ...st,
        [name]: true,
      }));

      const variables = {
        id,
        [name]: update[name],
      };

      if (name === "notes") variables.notes = JSON.stringify(update.notes);
      else if (name === "tutors")
        variables.tutors = update.tutors.map((tutor) => tutor._id);
      else if (name === "attendance")
        variables.attendance = Object.entries(
          update.attendance
        ).map(([tutee, info]) => ({ ...info, tutee }));

      setSessionInfo((st) => ({
        ...st,
        [name]: update[name],
      }));

      if (resetUpdate)
        setUpdate((st) => ({
          ...st,
          [name]: "",
        }));

      const { data } = await updateSession({ variables });

      data.updateSession.notes = JSON.parse(data.updateSession.notes);
      const attendance = {};
      data.updateSession.attendance.forEach(
        (attend) => (attendance[attend.tutee] = attend)
      );
      data.updateSession.attendance = attendance;

      setSessionInfo((st) => ({
        ...st,
        ...data.updateSession,
      }));

      toast.update(toastId.update, {
        render: "Successfully updated",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
    } catch (e) {
      toast.update(toastId.update, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

  useEffect(() => {
    if (data) {
      const attendance = {};
      data.getSession.attendance.forEach(
        (attend) => (attendance[attend.tutee] = attend)
      );
      setSessionInfo((st) => ({
        ...st,
        ...data.getSession,
        notes: JSON.parse(data.getSession.notes),
        attendance,
      }));
    }
  }, [data]);

  const [startEdit, cancelEdit] = useEdits({
    info: sessionInfo,
    setUpdate,
    setDisabled,
  });

  const onNotesChange = (content, delta, source, editor) => {
    setUpdate((st) => ({ ...st, notes: editor.getContents() }));
  };

  const deleteSession = async () => {
    try {
      toastId.deletion = toast("Deleting session...", { autoClose: false });
      await deleteSessionReq({ variables: { id } });
      toast.update(toastId.deletion, {
        render: "Session successfully deleted",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
      history.replace(`/dashboard/classes/${sessionInfo.class._id}`);
    } catch (e) {
      toast.update(toastId.deletion, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

  const toggleEdit = () => {
    setEditEnabled((st) => !st);
  };

  const modalHooks = {
    onOpen: startEdit,
    onClose: cancelEdit,
  };

  const [openSettings, settingsBinds] = useModal(false, "settings", modalHooks);
  const [openAttendances, attendancesBinds] = useModal(
    false,
    "attendance",
    modalHooks
  );
  const [openDeletion, deletionBinds] = useModal(false);

  const Edit = EditButton({
    disabled,
    startEdit,
    cancelEdit,
    editEnabled,
    saveInfo,
  });

  if (error) toast(error.message, { type: toast.TYPE.ERROR });
  if (loading || !sessionInfo.startTime) return <Loader />;

  return (
    <div className={styles.Class} onClick={rootClick}>
      <div>
        <h1>{format(sessionInfo.startTime, "EEEE d MMMM, yyyy")}</h1>
        <p className={styles.padding}>
          <Link to={`/dashboard/classes/${sessionInfo.class._id}`}>
            {sessionInfo.class.name}
          </Link>
        </p>
        <div className={styles.flex}>
          <p className={styles.date}>
            {`${format(sessionInfo.startTime, "h:mm aa")} - ${format(
              sessionInfo.endTime,
              "h:mm aa"
            )}`}
          </p>
          <div className={styles.edit}>
            <Menu {...menuBind}>
              <>
                <div onClick={toggleEdit}>
                  <FontAwesomeIcon icon={editEnabled ? faUnlock : faPenAlt} />{" "}
                  {editEnabled ? "Lock Edits" : "Edit Page"}
                </div>
                <div onClick={openSettings}>
                  <FontAwesomeIcon icon={faUserCog} /> Settings
                </div>
                <div onClick={openDeletion}>
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete Session
                </div>
              </>
            </Menu>
          </div>
        </div>
        <Edit type="location" />

        <Map
          location={sessionInfo.location}
          disabled={disabled.location}
          update={update.location}
          setUpdate={setUpdate}
        />

        <h2 className={styles.padding}>What we did</h2>
        <ReactQuill
          theme={disabled.notes ? null : "snow"}
          readOnly={disabled.notes}
          className={classNames({ disabled: disabled.notes })}
          value={disabled.notes ? sessionInfo.notes : update.notes}
          onChange={onNotesChange}
          modules={reactQuillModules}
        />
        <Edit
          type="notes"
          editEnabled={
            (currentUser.user.userType === "TUTOR" &&
              sessionInfo.tutors.some(
                (tutor) => tutor._id === currentUser.user._id
              )) ||
            (currentUser.user.userType === "TUTEE" &&
              sessionInfo.tutees.some(
                (tutee) => tutee._id === currentUser.user._id
              ) &&
              sessionInfo.settings.studentEditNotes)
          }
        />
      </div>
      <div className={styles.column}>
        <Tutors
          Edit={Edit}
          tutorsDisabled={disabled.tutors}
          tutors={sessionInfo.tutors}
          update={update.tutors}
          setUpdate={setUpdate}
        />
        <button className="btn" onClick={openAttendances}>
          Attendance
        </button>
      </div>
      <Modal {...settingsBinds}>
        <div className={styles.padding}>
          <h2>Settings</h2>
        </div>
      </Modal>

      <Modal {...attendancesBinds}>
        <Attendance
          Edit={Edit}
          update={update}
          setUpdate={setUpdate}
          tutees={sessionInfo.tutees}
          saveInfo={saveInfo}
        />
      </Modal>

      <Modal {...deletionBinds}>
        <div className={styles.padding}>
          <h2>Delete Session</h2>
          <p>
            Are you certain that you want to delete this session? You cannot
            revert this decision.
          </p>
          <button className="btn danger" onClick={deleteSession}>
            Delete Session
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Session;
