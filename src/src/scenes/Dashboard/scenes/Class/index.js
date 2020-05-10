import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { loader } from "graphql.macro";
import ReactQuill from "react-quill";
import Loader from "../../../../components/Loader";
import Modal from "../../../../components/Modal";

import Map from "../../components/Map";
import Tags from "../../components/Tags";
import reactQuillModules from "../reactQuillModules";

import EditButton from "../../components/EditButton";
import Column from "./components/Column";
import Menu from "../../components/Menu";

import useMenu from "../../hooks/useMenu";

import "react-quill/dist/quill.snow.css";
import styles from "../../class.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenAlt,
  faUserCog,
  faUnlock,
} from "@fortawesome/free-solid-svg-icons";

const GET_CLASS = loader("./graphql/GetClass.gql");
const UPDATE_CLASS = loader("./graphql/UpdateClass.gql");
const AUTOCOMPLETE_TUTOR = loader("./graphql/Autocomplete.gql");

let toastId = null;

const Class = ({ currentUser }) => {
  const { id } = useParams();

  const [classInfo, setClassInfo] = useState({
    description: { ops: [] },
  });

  const [disabled, setDisabled] = useState({
    name: true,
    description: true,
    tutors: true,
    date: true,
    sessions: true,
    location: true,
    preferences: true,
  });

  const [update, setUpdate] = useState({
    name: "",
    description: "",
    tutors: "",
    date: "",
    sessions: "",
    location: "",
    preferences: "",
  });

  const [editEnabled, setEditEnabled] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [rootClick, menuBind] = useMenu(false);

  const { loading, error, data } = useQuery(GET_CLASS, {
    variables: { id },
  });

  const [updateClass] = useMutation(UPDATE_CLASS);

  const { refetch: autocompleteFetch } = useQuery(AUTOCOMPLETE_TUTOR, {
    skip: true,
  });

  useEffect(() => {
    if (data) {
      setClassInfo((st) => ({
        ...st,
        ...data.getClass,
        description: JSON.parse(data.getClass.description),
      }));
    }
  }, [data]);

  const onInfoChange = (e) => {
    e.persist();
    setUpdate((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const saveInfo = async (name) => {
    try {
      toastId = toast("Updating class...", { autoClose: false });

      const variables = {
        id,
        [name]: update[name],
      };

      if (name === "description")
        variables.description = JSON.stringify(update.description);
      else if (name === "tutors")
        variables.tutors = update.tutors.map((tutor) => tutor._id);

      setUpdate((st) => ({
        ...st,
        [name]: "",
      }));

      setClassInfo((st) => ({
        ...st,
        [name]: update[name],
      }));

      const { data } = await updateClass({ variables });

      data.updateClass.description = JSON.parse(data.updateClass.description);

      setClassInfo((st) => ({
        ...st,
        ...data.updateClass,
      }));

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

  const toggleDisabled = (name) => {
    if (disabled[name]) {
      setUpdate((st) => ({
        ...st,
        [name]:
          typeof classInfo[name] === "object"
            ? Array.isArray(classInfo[name])
              ? [...classInfo[name]]
              : { ...classInfo[name] }
            : classInfo[name],
      }));
    } else saveInfo(name);
    setDisabled((st) => ({
      ...st,
      [name]: !st[name],
    }));
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

  const closeModal = () => {
    cancelUpdate("preferences");
    setModalOpen(false);
  };

  const onDescriptionChange = (content, delta, source, editor) => {
    if (!disabled.description)
      setUpdate((st) => ({
        ...st,
        description: editor.getContents(),
      }));
  };

  const onPreferencesChange = (e) => {
    e.persist();

    const { target } = e;
    setUpdate((st) => {
      const newState = { ...st };
      if (!st.preferences) newState.preferences = {};
      newState.preferences[target.name] =
        target.type === "checkbox" ? target.checked : target.value;

      return newState;
    });
  };

  const toggleEdit = () => {
    setEditEnabled((st) => !st);
  };

  const openModal = () => {
    toggleDisabled("preferences");
    setModalOpen(true);
  };

  const onPreferencesSubmit = (e) => {
    e.preventDefault();
    toggleDisabled("preferences");
    setModalOpen(false);
  };

  const Edit = EditButton({
    disabled,
    toggleDisabled,
    cancelUpdate,
    editEnabled,
  });

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
          <div className={styles.padding}>
            <Tags tags={classInfo.tags} />
          </div>
          <div className={styles.edit}>
            <Menu {...menuBind}>
              <>
                <div onClick={toggleEdit}>
                  {editEnabled ? "Lock Edits" : "Edit Page"}{" "}
                  <FontAwesomeIcon icon={editEnabled ? faUnlock : faPenAlt} />
                </div>
                <div onClick={openModal}>
                  Preferences <FontAwesomeIcon icon={faUserCog} />
                </div>
              </>
            </Menu>
          </div>
        </div>

        <div className={styles.section}>
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
      <Column
        Edit={Edit}
        disabled={disabled}
        classInfo={classInfo}
        update={update}
        setUpdate={setUpdate}
        autocompleteFetch={autocompleteFetch}
      />
      <Modal open={modalOpen} onClose={closeModal}>
        <div className={styles.padding}>
          <h2>Preferences</h2>
          <form onSubmit={onPreferencesSubmit}>
            <div className="field checkbox">
              <input
                type="checkbox"
                name="publicClass"
                id="publicClass"
                checked={update.preferences.publicClass}
                onChange={onPreferencesChange}
              />
              <label htmlFor="publicClass">
                Public class
                <div className="small">
                  If checked, anyone can view and request to join this class
                </div>
              </label>
            </div>
            <div className="field checkbox">
              <input
                type="checkbox"
                name="studentInstantiation"
                id="studentInstantiation"
                checked={update.preferences.studentInstantiation}
                onChange={onPreferencesChange}
              />
              <label htmlFor="studentInstantiation">
                Students can instantiate sessions
              </label>
            </div>
            <div className="field checkbox">
              <input
                type="checkbox"
                name="studentAgreeSessions"
                id="studentAgreeSessions"
                checked={update.preferences.studentAgreeSessions}
                onChange={onPreferencesChange}
              />
              <label htmlFor="studentAgreeSessions">
                Require students to accept to session times
                <div className="small">
                  If checked, students will be prompted to "accept" or "decline"
                  everytime a new session is created (recommended for larger
                  classes)
                </div>
              </label>
            </div>
            <button className="btn">Save</button>
          </form>
        </div>
      </Modal>
    </div>
  );
};

export default Class;
