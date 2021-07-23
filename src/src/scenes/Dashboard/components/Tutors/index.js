import React from "react";
import ProfilePicture from "../ProfilePicture";
import { Link } from "react-router-dom";
import classNames from "classnames";
import useUserChange from "../../hooks/useUserChange";
import Autocomplete from "../../components/Autocomplete";
import useDM from "../../hooks/useDM";

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faBars,
  faTrashAlt,
  faComments,
} from "@fortawesome/free-solid-svg-icons";
import styles from "../../class.module.scss";

const DragHandle = SortableHandle(() => (
  <FontAwesomeIcon icon={faBars} size="lg" className={styles.draghandle} />
));
const SortableItem = SortableElement(
  ({ tutor, editEnabled, deleteTutor, callDM, user }) => (
    <Link
      to={`/dashboard/tutors/${tutor._id}`}
      className={classNames("card", "y", styles.section)}
      onClick={(e) => {
        if (editEnabled) e.preventDefault();
      }}
    >
      {tutor.pfp && !editEnabled && (
        <ProfilePicture pfp={tutor.pfp} alt={tutor.name} width="400" />
      )}
      <h3 className="body">
        {tutor.name}
        <div className={styles.userButtons}>
          {editEnabled ? (
            <>
              <button
                className="btn danger small"
                onClick={deleteTutor}
                data-id={tutor._id}
              >
                <FontAwesomeIcon icon={faTrashAlt} />
              </button>
              <DragHandle />
            </>
          ) : (
            tutor._id !== user._id && (
              <button
                className="btn small"
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                  callDM(tutor._id);
                }}
              >
                <FontAwesomeIcon icon={faComments} />
              </button>
            )
          )}
        </div>
      </h3>
    </Link>
  )
);

const SortableList = SortableContainer(
  ({ tutors, editEnabled, deleteTutor, callDM, user }) => (
    <div className={styles.column}>
      {tutors.map((tutor, index) => (
        <SortableItem
          key={tutor._id}
          index={index}
          tutor={tutor}
          editEnabled={editEnabled}
          deleteTutor={deleteTutor}
          callDM={callDM}
          user={user}
        />
      ))}
    </div>
  )
);

const Tutors = ({
  Edit,
  showEdit = true,
  tutorsDisabled,
  tutors,
  update,
  setUpdate,
  user,
}) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    setUpdate((st) => {
      const reordered = [...st.tutors];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);

      return { ...st, tutors: reordered };
    });
  };

  const [tutorBinds, deleteTutor] = useUserChange({
    setUpdate,
    userType: "tutors",
  });

  const callDM = useDM();

  return (
    <>
      <div className={styles.flex}>
        <h2>Tutors</h2>
        {showEdit && <Edit type="tutors" />}
      </div>
      <SortableList
        tutors={tutorsDisabled ? tutors : update}
        onSortEnd={onSortEnd}
        useDragHandle
        deleteTutor={deleteTutor}
        editEnabled={!tutorsDisabled}
        callDM={callDM}
        user={user}
      />
      {!tutorsDisabled && (
        <div className="card">
          <div className="body">
            <Autocomplete {...tutorBinds} userType="tutor" />
          </div>
        </div>
      )}
    </>
  );
};

export default Tutors;
