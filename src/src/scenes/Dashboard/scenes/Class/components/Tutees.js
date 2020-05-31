import React from "react";
import classNames from "classnames";
import useUserChange from "../../../hooks/useUserChange";
import Autocomplete from "../../../components/Autocomplete";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons";

import styles from "../../../class.module.scss";

const Tutees = ({
  update,
  setUpdate,
  classInfo,
  disabled,
  Edit,
  currentUser,
}) => {
  const [tuteeBinds, deleteTutee] = useUserChange({
    setUpdate,
    userType: "tutees",
  });

  const tutees = disabled ? classInfo : update;

  return (
    <div className={styles.padding}>
      <h2 className={styles.padding}>Tutees</h2>
      <p className={styles.padding}>Registered tutees for this class: </p>
      {tutees.length ? (
        tutees.map((tutee) => (
          <div className={classNames("card y", styles.section)} key={tutee._id}>
            <div className="body">
              <h3>
                {tutee.name}
                {!disabled && (
                  <button
                    className={classNames("btn small danger", styles.editUser)}
                    onClick={deleteTutee}
                    data-id={tutee._id}
                  >
                    <FontAwesomeIcon icon={faTrashAlt} />
                  </button>
                )}
              </h3>
            </div>
          </div>
        ))
      ) : (
        <p className={styles.padding}>
          <em>There are no registered tutees</em>
        </p>
      )}
      {currentUser.user.userType === "TUTOR" && (
        <>
          <p className={styles.padding}>Awaiting user confirmation: </p>
          {/* todo */}

          {!disabled && (
            <div className="card y">
              <div className="body">
                <Autocomplete {...tuteeBinds} userType="tutee" />
              </div>
            </div>
          )}
          <Edit type="tutees" editEnabled={true} />
        </>
      )}
    </div>
  );
};

export default Tutees;
