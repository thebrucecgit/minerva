import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { loader } from "graphql.macro";
import classNames from "classnames";
import { useQuery, useMutation } from "@apollo/client";
import { format, isAfter } from "date-fns";
import ReactQuill from "react-quill";
import { toast } from "react-toastify";
import DatePicker from "react-datepicker";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";

import Settings from "./components/Settings";
import EditButton from "../../components/EditButton";
import Menu from "../../components/Menu";
import Tutors from "../../components/Tutors";
import Map from "../../components/Map";
import Modal from "../../../../components/Modal";
import Review from "./components/Review";
import reactQuillModules from "../reactQuillModules";

import useMenu from "../../hooks/useMenu";
import useEdits from "../../hooks/useEdits";
import useModal from "../../hooks/useModal";
import usePreferences from "../../hooks/usePreferences";
import useCancelSession from "./hooks/useCancelSession";
import useDeleteSession from "./hooks/useDeleteSession";

import styles from "../../class.module.scss";
import "react-quill/dist/quill.snow.css";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPenAlt,
  faUserCog,
  faUnlock,
  faTrashAlt,
  faTimes,
  faVideo,
} from "@fortawesome/free-solid-svg-icons";
import SessionRequestResponse from "scenes/Dashboard/components/SessionRequestResponse";

const GET_SESSION = loader("./graphql/GetSession.gql");
const UPDATE_SESSION = loader("./graphql/UpdateSession.gql");

const toastId = {};

const Session = ({ currentUser }) => {
  const { id } = useParams();

  const [sessionInfo, setSessionInfo] = useState({});
  const [update, setUpdate] = useState({
    name: "",
    tutors: "",
    location: "",
    notes: "",
    settings: "",
    startTime: "",
    length: "",
  });

  const [disabled, setDisabled] = useState({
    name: true,
    tutors: true,
    location: true,
    notes: true,
    settings: true,
    startTime: true,
    length: true,
  });

  const [sessionEnded, setSessionEnded] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);
  const [rootClick, menuBind] = useMenu(false);

  const { loading, error, data } = useQuery(GET_SESSION, {
    variables: { id },
  });

  const [updateSession] = useMutation(UPDATE_SESSION);

  const [
    cancelSession,
    openCancellation,
    cancellationBinds,
    cancellationReason,
    onReasonChange,
  ] = useCancelSession({ id, setSessionInfo });
  const [deleteSession, openDeletion, deletionBinds] = useDeleteSession({
    id,
    classId: sessionInfo.class?._id,
  });

  const saveInfo = async (name, { resetUpdate = true } = {}) => {
    try {
      toastId.update = toast("Updating session...", { autoClose: false });

      const names = Array.isArray(name) ? name : [name];

      setDisabled((st) => {
        const disabledUpdate = { ...st };
        names.forEach((n) => {
          disabledUpdate[n] = true;
        });
        return disabledUpdate;
      });

      const variables = { id };

      names.forEach((n) => {
        switch (n) {
          case "notes": {
            variables.notes = JSON.stringify(update.notes);
            break;
          }
          case "tutors": {
            variables.tutors = update.tutors.map((tutor) => tutor._id);
            break;
          }
          case "length": {
            variables.length = parseInt(update.length);
            break;
          }
          default: {
            variables[n] = update[n];
          }
        }
      });

      setSessionInfo((st) => {
        const sessionInfoUpdate = { ...st };
        names.forEach((n) => {
          sessionInfoUpdate[n] = update[n];
        });
        return sessionInfoUpdate;
      });

      if (resetUpdate)
        setUpdate((st) => {
          const resets = { ...st };
          names.forEach((n) => {
            resets[n] = "";
          });
          return resets;
        });

      const { data } = await updateSession({ variables });

      data.updateSession.notes = JSON.parse(data.updateSession.notes);

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
    let timerId;
    if (data) {
      const ended = isAfter(new Date(), data.getSession.endTime);
      setSessionEnded(ended);
      if (!ended) {
        timerId = setTimeout(() => {
          setSessionEnded(true);
        }, data.getSession.endTime - new Date());
      }

      setSessionInfo((st) => ({
        ...st,
        ...data.getSession,
        notes: JSON.parse(data.getSession.notes),
      }));
    }
    return () => {
      clearTimeout(timerId);
    };
  }, [data]);

  const settingsBind = usePreferences({
    setUpdate,
    saveInfo,
    name: "settings",
  });

  const [startEdit, cancelEdit] = useEdits({
    info: sessionInfo,
    setUpdate,
    setDisabled,
  });

  const onNotesChange = (content, delta, source, editor) => {
    setUpdate((st) => ({ ...st, notes: editor.getContents() }));
  };

  const toggleEdit = () => {
    setEditEnabled((st) => !st);
  };

  const modalHooks = {
    onOpen: startEdit,
    onClose: cancelEdit,
  };

  const [openSettings, settingsBinds] = useModal(false, "settings", modalHooks);

  const onTimeChange = (startTime) => {
    setUpdate((st) => ({
      ...st,
      startTime,
    }));
  };

  const onInfoChange = (e) => {
    e.persist();
    setUpdate((st) => ({
      ...st,
      [e.target.name]: e.target.value,
    }));
  };

  const Edit = EditButton({
    disabled,
    startEdit,
    cancelEdit,
    editEnabled,
    saveInfo,
  });

  if (error) return <Error error={error} />;
  if (loading || !sessionInfo.startTime) return <Loader />;

  const users = [...sessionInfo.tutees, ...sessionInfo.tutors];
  const isTutor = sessionInfo.tutors.some(
    (t) => t._id === currentUser.user._id
  );

  return (
    <div className={styles.Class} onClick={rootClick}>
      <div>
        <div className={styles.flex}>
          {disabled.name ? (
            <h1>{sessionInfo.name}</h1>
          ) : (
            <input
              type="text"
              name="name"
              value={update.name}
              onChange={onInfoChange}
            />
          )}

          <Edit type="name" />
        </div>
        {sessionInfo.status === "REJECT" && (
          <div className="alert danger">
            This session has been rejected by{" "}
            {
              users.find(
                (user) =>
                  sessionInfo.userResponses.find(
                    (res) => res.response === "REJECT"
                  ).user === user._id
              ).name
            }
            .
          </div>
        )}
        {sessionInfo.status === "CANCEL" && (
          <div className="alert danger">
            <p>
              This session has been cancelled by{" "}
              {
                users.find((user) => user._id === sessionInfo.cancellation.user)
                  .name
              }
              .
            </p>
            <p>{sessionInfo.cancellation.reason}</p>
          </div>
        )}
        {sessionInfo.status === "UNCONFIRM" && (
          <>
            <div className="alert warning">
              <>
                This session has not yet been confirmed by the following:{" "}
                <ul>
                  {users
                    .filter(
                      (user) =>
                        !sessionInfo.userResponses.some(
                          (res) => res.user === user._id
                        )
                    )
                    .map((user) => (
                      <li key={user._id}>
                        {user.name}{" "}
                        {user._id === currentUser.user._id && "(you)"}
                      </li>
                    ))}
                </ul>
              </>
            </div>
            {!sessionInfo.userResponses.some(
              (res) => res.user === currentUser.user._id
            ) && (
              <SessionRequestResponse
                onChange={(sessionData) =>
                  setSessionInfo((st) => ({ ...st, ...sessionData }))
                }
                id={id}
              />
            )}
          </>
        )}

        {sessionEnded && sessionInfo.status !== "CANCEL" && (
          <Review
            id={id}
            isTutor={isTutor}
            currentUser={currentUser}
            tutorReviews={sessionInfo.tutorReviews}
            tuteeReviews={sessionInfo.tuteeReviews}
            onChange={(change) =>
              setSessionInfo((st) => ({ ...st, ...change }))
            }
          />
        )}

        <div className={styles.flex}>
          <p className={styles.date}>
            {disabled.startTime ? (
              `${format(sessionInfo.startTime, "EEEE, d MMMM yyyy")}, ${format(
                sessionInfo.startTime,
                "h:mm aa"
              )} - ${format(sessionInfo.endTime, "h:mm aa")}`
            ) : (
              <div className={styles.flex}>
                <DatePicker
                  selected={update.startTime}
                  onChange={onTimeChange}
                  showTimeSelect
                  timeFormat="h:mm aa"
                  timeIntervals={15}
                  timeCaption="Time"
                  dateFormat="d MMMM yyyy h:mm aa"
                />
                <select
                  name="length"
                  value={update.length}
                  onChange={onInfoChange}
                >
                  <option value="30">30 Minutes</option>
                  <option value="45">45 Minutes</option>
                  <option value="60">60 Minutes</option>
                  <option value="90">90 Minutes</option>
                  <option value="120">120 Minutes</option>
                </select>
              </div>
            )}
          </p>
          <Edit type={["startTime", "length"]} editEnabled />
          <div className={styles.menu}>
            <Menu {...menuBind}>
              {isTutor && (
                <div onClick={toggleEdit}>
                  <FontAwesomeIcon icon={editEnabled ? faUnlock : faPenAlt} />{" "}
                  {editEnabled ? "Lock Edits" : "Edit Page"}
                </div>
              )}
              {isTutor && (
                <div onClick={openSettings}>
                  <FontAwesomeIcon icon={faUserCog} /> Settings
                </div>
              )}
              {sessionInfo.status !== "CANCEL" && (
                <div onClick={openCancellation}>
                  <FontAwesomeIcon icon={faTimes} /> Cancel Session
                </div>
              )}
              {isTutor && (
                <div onClick={openDeletion}>
                  <FontAwesomeIcon icon={faTrashAlt} /> Delete Session
                </div>
              )}
            </Menu>
          </div>
        </div>

        {sessionInfo.settings.online ? (
          <a
            className={classNames(styles.padding, styles.videoLink)}
            href={sessionInfo.videoLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className={styles.videoLinkPrompt}>
              This session is online! Click here to join the video call.
            </div>
            <div className={styles.videoLinkIcon}>
              <FontAwesomeIcon icon={faVideo} />
            </div>
          </a>
        ) : (
          <>
            <Edit type="location" />
            <Map
              location={sessionInfo.location}
              disabled={disabled.location}
              update={update.location}
              setUpdate={setUpdate}
            />
          </>
        )}

        <h2 className={classNames(styles.padding, styles.sessionNotesHeader)}>
          Session Notes
        </h2>
        <ReactQuill
          theme={disabled.notes ? null : "snow"}
          readOnly={disabled.notes}
          className={classNames({ disabled: disabled.notes })}
          defaultValue={disabled.notes ? sessionInfo.notes : update.notes}
          onChange={onNotesChange}
          modules={reactQuillModules}
        />
        <Edit
          type="notes"
          editEnabled={isTutor || sessionInfo.settings.studentEditNotes}
        />
      </div>

      <div className={styles.column}>
        <Tutors
          Edit={Edit}
          showEdit={false} // TODO: REFACTOR TUTORS
          tutorsDisabled={disabled.tutors}
          tutors={sessionInfo.tutors}
          update={update.tutors}
          setUpdate={setUpdate}
          user={currentUser.user}
        />
      </div>

      <Modal {...settingsBinds}>
        <Settings {...settingsBind} update={update.settings} />
      </Modal>

      <Modal {...cancellationBinds}>
        <div className={styles.padding}>
          <h2>Cancel Session</h2>
          <form onSubmit={cancelSession}>
            <p>
              Are you certain that you want to cancel this session? Please give
              a reason:
            </p>
            <textarea
              name="reason"
              required
              onChange={onReasonChange}
              value={cancellationReason}
              placeholder="eg. Jimmy is feeling unwell"
            />
            <button className="btn danger">Cancel Session</button>
          </form>
        </div>
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
