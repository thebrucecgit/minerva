import React, { useEffect, useState, useCallback } from "react";
import classNames from "classnames";
import { Link, useParams } from "react-router-dom";
import { useQuery } from "@apollo/client";
import { loader } from "graphql.macro";
import { format } from "date-fns";
import TagsEdit from "@yaireo/tagify/dist/react.tagify";
import ReactQuill from "react-quill";
import Loader from "../../../../components/Loader";
import Modal from "../../../../components/Modal";

import reactQuillModules from "../reactQuillModules";
import Map from "../../components/Map";
import Tags from "../../components/Tags";
import Tutors from "../../components/Tutors";
import EditButton from "../../components/EditButton";
import Menu from "../../components/Menu";
import InstantiateSession from "./components/InstantiateSession";
import Preferences from "./components/Preferences";
import Tutees from "./components/Tutees";

import useMenu from "../../hooks/useMenu";
import useEdits from "../../hooks/useEdits";
import useModal from "../../hooks/useModal";
import useInstantiateSession from "./hooks/useInstantiateSession";
import usePreferences from "../../hooks/usePreferences";
import useSeeAllSessions from "./hooks/useSeeAllSessions";
import useDeleteClass from "./hooks/useDeleteClass";
import useLeaveClass from "./hooks/useLeaveClass";
import useSaveInfo from "./hooks/useSaveInfo";

import selections from "../../../../config/whitelist.json";

import "@yaireo/tagify/dist/tagify.css";
import "react-quill/dist/quill.snow.css";
import styles from "../../class.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenAlt,
  faUserCog,
  faUnlock,
  faTrashAlt,
  faPhoneVolume,
  faCommentAlt,
  faExclamationTriangle,
  faTimes,
  faDoorOpen,
} from "@fortawesome/free-solid-svg-icons";

const SESSIONS_LIMIT = 5;
const GET_CLASS = loader("./graphql/GetClass.gql");
const whitelist = [...selections.academic, ...selections.extra];

const Class = ({ currentUser }) => {
  const { id } = useParams();

  const [classInfo, setClassInfo] = useState({
    description: { ops: [] },
  });

  const [disabled, setDisabled] = useState({
    name: true,
    description: true,
    tutors: true,
    tutees: true,
    date: true,
    sessions: true,
    location: true,
    preferences: true,
    tags: true,
  });

  const [update, setUpdate] = useState({
    name: "",
    description: "",
    tutors: "",
    tutees: "",
    date: "",
    sessions: "",
    location: "",
    preferences: "",
    tags: "",
  });

  const [oldSessions, setOldSessions] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);
  const [rootClick, menuBind] = useMenu(false);
  const sessionBind = useInstantiateSession();

  const {
    loading,
    error,
    data,
    refetch: fetchAllSessions,
  } = useQuery(GET_CLASS, {
    variables: { id, sessionLimit: SESSIONS_LIMIT, oldSessions },
  });

  const [loadedAllSessions, setLoadedAllSessions] = useState(false);

  useEffect(() => {
    if (data) {
      setClassInfo((st) => ({
        ...st,
        ...data.getClass,
        description: JSON.parse(data.getClass.description),
      }));
      setLoadedAllSessions(data.getClass.sessions.length < SESSIONS_LIMIT);
    }
  }, [data]);

  // Callbacks

  const onInfoChange = (e) => {
    e.persist();
    setUpdate((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const [startEdit, cancelEdit] = useEdits({
    info: classInfo,
    setUpdate,
    setDisabled,
  });

  const modalHooks = {
    onOpen: startEdit,
    onClose: cancelEdit,
  };

  const [openPreferences, preferencesBinds] = useModal(
    false,
    "preferences",
    modalHooks
  );
  const [openTutees, tuteesBinds] = useModal(false, "tutees", modalHooks);
  const [openDeletion, deletionBinds] = useModal(false);
  const [openLeave, leaveBinds] = useModal(false);

  const saveInfo = useSaveInfo(
    id,
    setClassInfo,
    setDisabled,
    update,
    setUpdate
  );
  const seeAllSessions = useSeeAllSessions(
    fetchAllSessions,
    setClassInfo,
    setLoadedAllSessions
  );
  const deleteClass = useDeleteClass(id);
  const leaveClass = useLeaveClass(id);

  const onDescriptionChange = (content, delta, source, editor) => {
    if (!disabled.description)
      setUpdate((st) => ({
        ...st,
        description: editor.getContents(),
      }));
  };

  const toggleEdit = () => {
    setEditEnabled((st) => !st);
  };

  const preferencesBind = usePreferences({
    setUpdate,
    saveInfo,
    name: "preferences",
  });

  const onTagsChange = useCallback((e, name) => {
    setUpdate((st) => ({
      ...st,
      [name]: e.detail.tagify.value.map((tag) => tag.value),
    }));
  }, []);

  const Edit = EditButton({
    disabled,
    startEdit,
    saveInfo,
    cancelEdit,
    editEnabled,
  });

  if (error) return error.message;
  if (loading || !classInfo.name) return <Loader />;

  const isTutor = classInfo.tutors.some((c) => c._id === currentUser.user._id);

  return (
    <div className={styles.Class} onClick={rootClick}>
      <div className={styles.content}>
        <div className={styles.flex}>
          {disabled.name ? (
            <h1>{classInfo.name}</h1>
          ) : (
            <input
              type="text"
              className={styles.name}
              name="name"
              value={update.name}
              onChange={onInfoChange}
            />
          )}
          <Edit type="name" />
        </div>

        <div className={styles.flex}>
          <div className={styles.padding}>
            {disabled.tags ? (
              <Tags tags={classInfo.tags} />
            ) : (
              <TagsEdit
                settings={{
                  placeholder: "eg. English, Mathematics",
                  whitelist,
                }}
                onChange={(e) => onTagsChange(e, "tags")}
                defaultValue={update.tags}
                name="extras"
              />
            )}
          </div>
          <div className={styles.edit}>
            {classInfo.preferences.enableChat && classInfo.chat && (
              <Link to={`/dashboard/chats/${classInfo.chat.channel}`}>
                <button className="btn">
                  Group Chat <FontAwesomeIcon icon={faCommentAlt} />
                </button>
              </Link>
            )}

            <Edit type="tags" />
            <Menu {...menuBind}>
              <>
                {isTutor && (
                  <div onClick={toggleEdit}>
                    <FontAwesomeIcon icon={editEnabled ? faUnlock : faPenAlt} />{" "}
                    {editEnabled ? "Lock Edits" : "Edit Page"}
                  </div>
                )}
                {isTutor && (
                  <div onClick={openPreferences}>
                    <FontAwesomeIcon icon={faUserCog} /> Preferences
                  </div>
                )}
                <div onClick={openLeave}>
                  <FontAwesomeIcon icon={faDoorOpen} /> Leave Class
                </div>
                {isTutor && (
                  <div onClick={openDeletion} className="danger">
                    <FontAwesomeIcon icon={faTrashAlt} /> Delete Class
                  </div>
                )}
              </>
            </Menu>
          </div>
        </div>

        <div className="card">
          <img
            src={classInfo.image}
            alt="class cover"
            className={styles.cover}
          />
        </div>

        <div className={styles.flex}>
          {disabled.date ? (
            <h3 className={styles.date}>{classInfo.date}</h3>
          ) : (
            <input
              type="text"
              className={styles.date}
              name="date"
              value={update.date}
              onChange={onInfoChange}
            />
          )}

          <Edit type="date" />
        </div>

        <ReactQuill
          theme={disabled.description ? null : "snow"}
          readOnly={disabled.description}
          className={classNames({ disabled: disabled.description })}
          value={
            disabled.description ? classInfo.description : update.description
          }
          onChange={onDescriptionChange}
          modules={reactQuillModules}
        />
        <Edit type="description" />

        {classInfo.preferences.online ? (
          <a
            className={classNames(styles.padding, styles.videoLink)}
            href={classInfo.videoLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            Join Video Call <FontAwesomeIcon icon={faPhoneVolume} />
          </a>
        ) : (
          <>
            <Map
              location={classInfo.location}
              disabled={disabled.location}
              update={update.location}
              setUpdate={setUpdate}
            />
            <Edit type="location" />
          </>
        )}
      </div>

      <div className={styles.column}>
        <Tutors
          Edit={Edit}
          tutorsDisabled={disabled.tutors}
          tutors={classInfo.tutors}
          update={update.tutors}
          setUpdate={setUpdate}
          user={currentUser.user}
        />

        <div className={styles.flex}>
          <h2>Sessions</h2>
          <Edit type="sessions" />
        </div>
        <form>
          <div className="checkbox">
            <input
              type="checkbox"
              id="isOld"
              checked={oldSessions}
              onChange={(e) => setOldSessions(e.target.checked)}
            />
            <label htmlFor="isOld">View old sessions</label>
          </div>
        </form>
        {classInfo.sessions.length ? (
          <>
            {classInfo.sessions.map((session) => (
              <Link
                to={`/dashboard/sessions/${session._id}`}
                key={session._id}
                className="card y"
              >
                <h3
                  className="body"
                  title={
                    session.status === "UNCONFIRM"
                      ? "This session is not confirmed yet."
                      : "" + session.status === "REJECT"
                      ? "This session has been rejected."
                      : ""
                  }
                >
                  {format(session.startTime, "d MMMM yyyy")}{" "}
                  {session.status === "UNCONFIRM" && (
                    <FontAwesomeIcon icon={faExclamationTriangle} />
                  )}
                  {session.status === "REJECT" && (
                    <FontAwesomeIcon icon={faTimes} />
                  )}
                </h3>
              </Link>
            ))}
            {loadedAllSessions ? (
              <p className={styles.padding}>
                <em>All sessions have been loaded</em>
              </p>
            ) : (
              <button className="btn" onClick={seeAllSessions}>
                See all
              </button>
            )}
          </>
        ) : (
          <p className={styles.padding}>No session has been created yet</p>
        )}

        {(isTutor || classInfo.preferences.studentInstantiation) && (
          <InstantiateSession
            {...sessionBind}
            studentAgreeSessions={classInfo.preferences.studentAgreeSessions}
          />
        )}

        <h2>Tutees</h2>
        <button className="btn" onClick={() => openTutees(false)}>
          View Tutees
        </button>
        {isTutor && (
          <Link to={`/dashboard/classes/${id}/attendance`}>
            <button className={classNames("btn", styles.attendanceBtn)}>
              View Attendance
            </button>
          </Link>
        )}
      </div>

      <Modal {...preferencesBinds}>
        <Preferences {...preferencesBind} update={update.preferences} />
      </Modal>

      <Modal {...tuteesBinds}>
        <Tutees
          update={update.tutees}
          setUpdate={setUpdate}
          classInfo={classInfo.tutees}
          disabled={disabled.tutees}
          Edit={Edit}
          isTutor={isTutor}
        />
      </Modal>

      <Modal {...deletionBinds}>
        <div className={styles.padding}>
          <h2>Delete Class</h2>
          <p>
            Are you certain that you want to delete this class? You cannot
            revert this decision.
          </p>
          <button className="btn danger" onClick={deleteClass}>
            Delete Class
          </button>
        </div>
      </Modal>

      <Modal {...leaveBinds}>
        <div className={styles.padding}>
          <h2>Leave Class</h2>
          <p>
            Are you certain that you want to leave this class? You will have to
            ask the tutors to regain access.
          </p>
          <button className="btn danger" onClick={leaveClass}>
            Leave Class
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default Class;
