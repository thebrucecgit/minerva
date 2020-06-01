import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { loader } from "graphql.macro";
import { format } from "date-fns";
import { useHistory } from "react-router-dom";
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
import usePreferences from "./hooks/usePreferences";

import selections from "../../../../config/whitelist.json";

import "react-quill/dist/quill.snow.css";
import styles from "../../class.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenAlt,
  faUserCog,
  faUnlock,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

const SESSIONS_LIMIT = 5;

const GET_CLASS = loader("./graphql/GetClass.gql");
const UPDATE_CLASS = loader("./graphql/UpdateClass.gql");
const DELETE_CLASS = loader("./graphql/DeleteClass.gql");

const toastId = {};

const whitelist = [...selections.academic, ...selections.extra];

const Class = ({ currentUser }) => {
  const history = useHistory();
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

  const { loading, error, data, refetch: fetchAllSessions } = useQuery(
    GET_CLASS,
    {
      variables: { id, sessionLimit: SESSIONS_LIMIT, oldSessions },
    }
  );

  const [updateClass] = useMutation(UPDATE_CLASS);

  const [deleteClassReq] = useMutation(DELETE_CLASS);

  const [loadedAllSessions, setLoadedAllSessions] = useState(false);

  const seeAllSessions = async () => {
    try {
      toastId.sessions = toast("Fetching all sessions...", {
        autoClose: false,
      });

      const { data } = await fetchAllSessions({ sessionLimit: null });

      setClassInfo((st) => ({
        ...st,
        sessions: data.getClass.sessions,
      }));
      setLoadedAllSessions(true);

      toast.dismiss(toastId.sessions);
    } catch (e) {
      console.error(e);
      toast.update(toastId.sessions, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

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

  const onInfoChange = (e) => {
    e.persist();
    setUpdate((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const saveInfo = async (name, { resetUpdate = true } = {}) => {
    try {
      toastId.class = toast("Updating class...", { autoClose: false });

      setDisabled((st) => ({
        ...st,
        [name]: true,
      }));

      const variables = {
        id,
        [name]: update[name],
      };

      if (name === "description")
        variables.description = JSON.stringify(update.description);
      else if (name === "tutors")
        variables.tutors = update.tutors.map((tutor) => tutor._id);
      else if (name === "tutees")
        variables.tutees = update.tutees.map((tutee) => tutee._id);

      setClassInfo((st) => ({
        ...st,
        [name]: update[name],
      }));

      if (resetUpdate)
        setUpdate((st) => ({
          ...st,
          [name]: "",
        }));

      const { data } = await updateClass({ variables });

      data.updateClass.description = JSON.parse(data.updateClass.description);

      setClassInfo((st) => ({
        ...st,
        ...data.updateClass,
      }));

      toast.update(toastId.class, {
        render: "Successfully updated class",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
    } catch (e) {
      console.error(e);
      toast.update(toastId.class, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
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

  const deleteClass = async () => {
    try {
      toastId.deletion = toast("Deleting class...", { autoClose: false });
      await deleteClassReq({ variables: { id } });
      toast.update(toastId.deletion, {
        render: "Class successfully deleted",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
      history.replace("/dashboard");
    } catch (e) {
      toast.update(toastId.deletion, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

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

  const Edit = EditButton({
    disabled,
    startEdit,
    saveInfo,
    cancelEdit,
    editEnabled,
  });

  const preferencesBind = usePreferences({
    setUpdate,
    saveInfo,
  });

  const onTagsChange = (e, name) => {
    setUpdate((st) => ({
      ...st,
      [name]: e.detail.tagify.value.map((tag) => tag.value),
    }));
  };

  if (error) return error.message;
  if (loading || !classInfo.name) return <Loader />;

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
          <div className={classNames(styles.padding, styles.tags)}>
            {disabled.tags ? (
              <Tags tags={classInfo.tags} />
            ) : (
              <TagsEdit
                settings={{
                  placeholder: "eg. English, Mathematics",
                  whitelist,
                  callbacks: {
                    add: (e) => onTagsChange(e, "tags"),
                    remove: (e) => onTagsChange(e, "tags"),
                  },
                }}
                value={update.tags}
                name="extras"
              />
            )}
          </div>
          <div className={styles.edit}>
            {currentUser.user.userType === "TUTOR" && (
              <>
                <Edit type="tags" />
                <Menu {...menuBind}>
                  <>
                    <div onClick={toggleEdit}>
                      <FontAwesomeIcon
                        icon={editEnabled ? faUnlock : faPenAlt}
                      />{" "}
                      {editEnabled ? "Lock Edits" : "Edit Page"}
                    </div>
                    <div onClick={openPreferences}>
                      <FontAwesomeIcon icon={faUserCog} /> Preferences
                    </div>
                    <div onClick={openDeletion} className="danger">
                      <FontAwesomeIcon icon={faTrashAlt} /> Delete Class
                    </div>
                  </>
                </Menu>
              </>
            )}
          </div>
        </div>

        <div className="card">
          <img src={classInfo.image} alt="" />
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

        <Map
          location={classInfo.location}
          disabled={disabled.location}
          update={update.location}
          setUpdate={setUpdate}
        />
        <Edit type="location" />
      </div>

      <div className={styles.column}>
        <Tutors
          Edit={Edit}
          tutorsDisabled={disabled.tutors}
          tutors={classInfo.tutors}
          update={update.tutors}
          setUpdate={setUpdate}
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
                <h3 className="body">
                  {format(session.startTime, "d MMMM, yyyy")}
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

        {(currentUser.user.userType === "TUTOR" ||
          (currentUser.user.userType === "TUTEE" &&
            classInfo.preferences.studentInstantiation)) && (
          <InstantiateSession {...sessionBind} />
        )}

        <h2>Tutees</h2>
        <button className="btn" onClick={() => openTutees(false)}>
          View Tutees
        </button>
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
          currentUser={currentUser}
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
    </div>
  );
};

export default Class;
