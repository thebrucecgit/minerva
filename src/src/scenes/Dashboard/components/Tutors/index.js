import React, { useState } from "react";
import { Link } from "react-router-dom";
import classNames from "classnames";

import {
  SortableContainer,
  SortableElement,
  SortableHandle,
} from "react-sortable-hoc";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars, faTrashAlt } from "@fortawesome/free-solid-svg-icons";
import styles from "../../class.module.scss";

const DragHandle = SortableHandle(() => (
  <FontAwesomeIcon icon={faBars} size="lg" className={styles.draghandle} />
));
const SortableItem = SortableElement(({ tutor, editEnabled, deleteTutor }) => (
  <Link
    to={`/dashboard/tutors/${tutor._id}`}
    className={styles.section}
    onClick={(e) => {
      if (editEnabled) e.preventDefault();
    }}
  >
    {tutor.pfp && !editEnabled && <img src={tutor.pfp} alt={tutor.name} />}
    <h3>
      {tutor.name}
      {editEnabled && (
        <div className={styles.editTutor}>
          <button
            className="btn danger small"
            onClick={deleteTutor}
            data-id={tutor._id}
          >
            <FontAwesomeIcon icon={faTrashAlt} />
          </button>
          <DragHandle />
        </div>
      )}
    </h3>
  </Link>
));

const SortableList = SortableContainer(
  ({ tutors, editEnabled, deleteTutor }) => (
    <div className={styles.column}>
      {tutors.map((tutor, index) => (
        <SortableItem
          key={tutor._id}
          index={index}
          tutor={tutor}
          editEnabled={editEnabled}
          deleteTutor={deleteTutor}
        />
      ))}
    </div>
  )
);

const Tutors = ({ Edit, tutorsDisabled, tutors, update, setUpdate, fetch }) => {
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(false);
  const [autocomplete, setAutocomplete] = useState("");
  const [suggested, setSuggested] = useState([]);

  const onAutocompleteChange = async (e) => {
    const { value } = e.target;

    setAutocomplete(value);
    setUserInfo(null);

    if (value.length > 1) {
      setLoading(true);
      const { data } = await fetch({
        value: e.target.value,
        userType: "TUTOR",
      });

      setSuggested(data.getUsers);
      setLoading(false);
    } else {
      setSuggested([]);
    }
  };

  const selectSuggestion = (e) => {
    const { id } = e.currentTarget.dataset;
    const user = suggested.find((suggestion) => suggestion._id === id);
    setUserInfo({ _id: id, name: user.name });
    setAutocomplete(user.email);
    setSuggested([]);
  };

  const onSortEnd = ({ oldIndex, newIndex }) => {
    setUpdate((st) => {
      const reordered = [...st.tutors];
      const [removed] = reordered.splice(oldIndex, 1);
      reordered.splice(newIndex, 0, removed);

      return { ...st, tutors: reordered };
    });
  };

  const addTutor = () => {
    setUpdate((st) => {
      const tutors = [...st.tutors];
      tutors.push(userInfo);
      return {
        ...st,
        tutors,
      };
    });
    setAutocomplete("");
    setUserInfo(null);
  };

  const deleteTutor = (e) => {
    const { id } = e.currentTarget.dataset;
    setUpdate((st) => {
      const tutors = st.tutors.filter((tutor) => tutor._id !== id);
      return {
        ...st,
        tutors,
      };
    });
  };

  return (
    <>
      <div className={styles.flex}>
        <h2>Tutors</h2>
        <Edit type="tutors" />
      </div>
      <SortableList
        tutors={tutorsDisabled ? tutors : update}
        onSortEnd={onSortEnd}
        useDragHandle
        deleteTutor={deleteTutor}
        editEnabled={!tutorsDisabled}
      />
      {!tutorsDisabled && (
        <div className={styles.section}>
          <div className={styles.padding}>
            <label htmlFor="addTutor">Add tutor: </label>
            <div className={styles.autocomplete}>
              <input
                type="text"
                name="addTutor"
                id="addTutor"
                placeholder="Enter name or email"
                value={autocomplete}
                onChange={onAutocompleteChange}
              />
              <div className={styles.suggestions}>
                {suggested.map((user) => (
                  <div
                    className={styles.suggestion}
                    onClick={selectSuggestion}
                    data-id={user._id}
                  >
                    <div className={styles.tutorName}>{user.name}</div>
                    {user.email}
                  </div>
                ))}
              </div>
            </div>
            <button className="btn" disabled={!userInfo} onClick={addTutor}>
              Add
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default Tutors;
