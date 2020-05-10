import React, { useEffect, useState } from "react";
import classNames from "classnames";
import { toast } from "react-toastify";
import { Link, useParams } from "react-router-dom";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { loader } from "graphql.macro";
import { format } from "date-fns";
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

import useMenu from "../../hooks/useMenu";
import useInstantiateSession from "./hooks/useInstantiateSession";
import usePreferences from "./hooks/usePreferences";

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
  const sessionBind = useInstantiateSession();

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

  const toggleEdit = () => {
    setEditEnabled((st) => !st);
  };

  const openModal = () => {
    toggleDisabled("preferences");
    setModalOpen(true);
  };

  const Edit = EditButton({
    disabled,
    toggleDisabled,
    cancelUpdate,
    editEnabled,
  });

  const preferencesBind = usePreferences({
    setUpdate,
    toggleDisabled,
    setModalOpen,
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

      <div className={styles.column}>
        <Tutors
          Edit={Edit}
          tutorsDisabled={disabled.tutors}
          tutors={classInfo.tutors}
          update={update.tutors}
          setUpdate={setUpdate}
          fetch={autocompleteFetch}
        />

        <div className={styles.flex}>
          <h2>Sessions </h2>
          <Edit type="sessions" />
        </div>
        {classInfo.sessions.map((session) => (
          <Link
            to={`/dashboard/sessions/${session._id}`}
            key={session._id}
            className={styles.section}
          >
            <h3>{format(session.time, "d MMMM, yyyy")}</h3>
          </Link>
        ))}

        {!disabled.sessions && <InstantiateSession {...sessionBind} />}
      </div>

      <Modal open={modalOpen} onClose={closeModal}>
        <Preferences {...preferencesBind} update={update.tutors} />
      </Modal>
    </div>
  );
};

export default Class;
