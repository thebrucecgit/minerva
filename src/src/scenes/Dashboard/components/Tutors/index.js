import React from "react";
import { Link } from "react-router-dom";

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import styles from "../../class.module.scss";

const DragHandle = SortableHandle(() => <FontAwesomeIcon icon={faBars} />);
const SortableItem = SortableElement(({ tutor, showHandle }) => (
  <Link to={`/tutors/${tutor._id}`} className={styles.section}>
    {tutor.pfp && !showHandle && <img src={tutor.pfp} alt={tutor.name} />}
    <h3>
      {tutor.name}
      {showHandle && <DragHandle />}
    </h3>
  </Link>
));

const SortableList = SortableContainer(({ tutors, showHandle }) => (
  <div className={styles.column}>
    {tutors.map((tutor, index) => (
      <SortableItem
        key={tutor._id}
        index={index}
        tutor={tutor}
        showHandle={showHandle}
      />
    ))}
  </div>
));

const Tutors = ({ Edit, tutorsDisabled, tutors, setInfo }) => {
  const onSortEnd = ({ oldIndex, newIndex }) => {
    setInfo((st) => {
      const reordered = [...st.tutors];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);

      return { ...st, tutors: reordered };
    });
  };

  return (
    <>
      <div className={styles.flex}>
        <h2>Tutors</h2>
        <Edit type="tutors" />
      </div>
      <SortableList
        tutors={tutors}
        onSortEnd={onSortEnd}
        useDragHandle
        showHandle={!tutorsDisabled}
      />
    </>
  );
};

export default Tutors;
