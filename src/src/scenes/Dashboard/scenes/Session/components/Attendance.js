import React from "react";

import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faPlus,
  faThumbsUp,
  faThumbsDown,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";

import styles from "../../../class.module.scss";

const Attendance = ({ Edit, update, tutees, setUpdate, saveInfo }) => {
  const addReason = (e) => {
    const { tutee } = e.currentTarget.dataset;
    setUpdate((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [tutee]: {
          ...st.attendance[tutee],
          reason: "",
        },
      },
    }));
  };

  const removeReason = (e) => {
    const { tutee } = e.currentTarget.dataset;
    setUpdate((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [tutee]: {
          ...st.attendance[tutee],
          reason: null,
        },
      },
    }));
  };

  const onTextChange = (e) => {
    e.persist();
    const { tutee } = e.currentTarget.dataset;
    setUpdate((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [tutee]: {
          ...st.attendance[tutee],
          [e.target.name]: e.target.value,
        },
      },
    }));
  };

  const onChangeAttend = (e) => {
    e.persist();
    const { tutee } = e.currentTarget.dataset;
    setUpdate((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [tutee]: {
          ...st.attendance[tutee],
          attended: e.target.checked,
        },
      },
    }));
  };

  const onBehaviourSelect = (tutee, good) => {
    setUpdate((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [tutee]: {
          ...st.attendance[tutee],
          behaviourGood: good,
        },
      },
    }));
  };

  const onTagsChange = (e) => {
    const { tutee } = e.target.dataset;
    e.persist();
    setUpdate((st) => {
      const oldTags = Array.isArray(st.attendance[tutee]?.behaviourTags)
        ? st.attendance[tutee].behaviourTags
        : [];
      const behaviourTags = oldTags.includes(e.target.name)
        ? oldTags.filter((t) => t !== e.target.name)
        : [...oldTags, e.target.name];

      return {
        ...st,
        attendance: {
          ...st.attendance,
          [tutee]: {
            ...st.attendance[tutee],
            behaviourTags,
          },
        },
      };
    });
  };

  const onSave = () => {
    saveInfo("attendance", { resetUpdate: false });
  };

  return (
    <div className={styles.padding}>
      <h2>Attendance</h2>
      {tutees.map((tutee) => (
        <div
          className={classNames("card square y", styles.section)}
          key={tutee._id}
          data-tutee={tutee._id}
        >
          <div className={classNames("body", styles.username)}>
            <h3>{tutee.name}</h3>
            <div className={styles.editUser}>
              {!update.attendance[tutee._id]?.attended &&
                (typeof update.attendance[tutee._id]?.reason !== "string" ? (
                  <span
                    className={styles.addReason}
                    onClick={addReason}
                    data-tutee={tutee._id}
                  >
                    Add absence reason
                    <FontAwesomeIcon icon={faPlus} />
                  </span>
                ) : (
                  <span
                    className={styles.addReason}
                    onClick={removeReason}
                    data-tutee={tutee._id}
                  >
                    Remove absence reason
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </span>
                ))}
            </div>
            <input
              type="checkbox"
              checked={update.attendance[tutee._id]?.attended}
              data-tutee={tutee._id}
              onChange={onChangeAttend}
            />
          </div>

          <div className={classNames("body", styles.username)}>
            <p>Student Behaviour</p>
            <div className={styles.behaviour}>
              <button
                className={classNames("btn small", {
                  secondary:
                    typeof update.attendance[tutee._id]?.behaviourGood !==
                      "boolean" || !update.attendance[tutee._id]?.behaviourGood,
                })}
                onClick={() => onBehaviourSelect(tutee._id, true)}
              >
                <FontAwesomeIcon icon={faThumbsUp} />
              </button>
              <button
                className={classNames("btn small", {
                  secondary:
                    typeof update.attendance[tutee._id]?.behaviourGood !==
                      "boolean" || update.attendance[tutee._id]?.behaviourGood,
                })}
                onClick={() => onBehaviourSelect(tutee._id, false)}
              >
                <FontAwesomeIcon icon={faThumbsDown} />
              </button>
            </div>
          </div>
          {typeof update.attendance[tutee._id]?.behaviourGood === "boolean" &&
            !update.attendance[tutee._id]?.behaviourGood && (
              <div className="body">
                <p>Poor behaviour</p>
                {["late", "rude", "disruptive", "unfocused"].map((r) => (
                  <div key={r} className="checkbox">
                    <input
                      type="checkbox"
                      name={r}
                      id={r}
                      checked={
                        update.attendance[tutee._id]?.behaviourTags?.includes(
                          r
                        ) ?? false
                      }
                      data-tutee={tutee._id}
                      onChange={onTagsChange}
                    />
                    <label htmlFor={r}>{r}</label>
                  </div>
                ))}

                <input
                  type="text"
                  name="behaviourComment"
                  onChange={onTextChange}
                  data-tutee={tutee._id}
                  value={update.attendance[tutee._id]?.behaviourComment}
                  placeholder="Describe behaviour of tutee"
                />
              </div>
            )}

          {typeof update.attendance[tutee._id]?.reason === "string" && (
            <div className="body">
              <p>Reason for absence: </p>
              <input
                type="text"
                name="reason"
                onChange={onTextChange}
                value={update.attendance[tutee._id]?.reason}
                data-tutee={tutee._id}
                placeholder="eg. Medical illness"
              />
            </div>
          )}
        </div>
      ))}
      <button className="btn" onClick={onSave}>
        Save
      </button>
    </div>
  );
};

export default Attendance;
