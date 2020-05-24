import React from "react";

import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import styles from "../../../class.module.scss";

const Attendance = ({ Edit, update, tutees, setUpdate, saveInfo }) => {
  const addReason = (e) => {
    const {
      tutee,
    } = e.currentTarget.parentElement.parentElement.parentElement.dataset;
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
    const {
      tutee,
    } = e.currentTarget.parentElement.parentElement.parentElement.dataset;
    setUpdate((st) => {
      const attendance = { ...st.attendance };
      delete attendance[tutee];
      return {
        ...st,
        attendance,
      };
    });
  };

  const onReasonChange = (e) => {
    e.persist();
    const { tutee } = e.currentTarget.dataset;
    setUpdate((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [tutee]: {
          ...st.attendance[tutee],
          reason: e.target.value,
        },
      },
    }));
  };

  const onChangeAttend = (e) => {
    e.persist();
    const {
      tutee,
    } = e.currentTarget.parentElement.parentElement.parentElement.dataset;
    setUpdate((st) => ({
      ...st,
      attendance: {
        ...st.attendance,
        [tutee]: {
          ...st[tutee],
          attended: e.target.checked,
        },
      },
    }));
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
          <h3 className={styles.flex}>
            {tutee.name}
            <div className={styles.editUser}>
              {!update.attendance[tutee._id]?.attended &&
                (typeof update.attendance[tutee._id]?.reason !== "string" ? (
                  <span className={styles.addReason} onClick={addReason}>
                    Add reason for absence
                    <FontAwesomeIcon icon={faPlus} />
                  </span>
                ) : (
                  <span className={styles.addReason} onClick={removeReason}>
                    Remove reason for absence
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </span>
                ))}
              <input
                type="checkbox"
                checked={update.attendance[tutee._id]?.attended}
                onChange={onChangeAttend}
              />
            </div>
          </h3>

          {typeof update.attendance[tutee._id]?.reason === "string" && (
            <div className="body">
              <p>Reason for absence: </p>
              <input
                type="text"
                onChange={onReasonChange}
                value={update.attendance[tutee._id]?.reason}
                data-tutee={tutee._id}
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
