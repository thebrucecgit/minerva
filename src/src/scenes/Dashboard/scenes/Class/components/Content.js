import React from "react";
import classNames from "classnames";
import ReactQuill from "react-quill";

import Map from "../../../components/Map";
import reactQuillModules from "../../reactQuillModules";

import "react-quill/dist/quill.snow.css";
import styles from "../../../class.module.scss";

const Content = ({ Edit, classInfo, disabled, setClassInfo, onInfoChange }) => {
  const onDescriptionChange = (content, delta, source, editor) => {
    setClassInfo((st) => ({
      ...st,
      description: editor.getContents(),
    }));
  };
  return (
    <div className={styles.content}>
      <div className={styles.flex}>
        {disabled.name ? (
          <h1>{classInfo.name}</h1>
        ) : (
          <input
            type="text"
            className={styles.name}
            name="name"
            value={classInfo.name}
            onChange={onInfoChange}
          />
        )}
        <Edit type="name" />
      </div>
      <p className={styles.padding}>
        {classInfo.tags.map((tag, i) => (
          <span key={i}>{tag}</span>
        ))}
      </p>
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
            value={classInfo.date}
            onChange={onInfoChange}
          />
        )}

        <Edit type="date" />
      </div>

      <ReactQuill
        theme={disabled.description ? null : "snow"}
        readOnly={disabled.description}
        className={classNames({ disabled: disabled.description })}
        value={classInfo.description}
        onChange={onDescriptionChange}
        modules={reactQuillModules}
      />
      <Edit type="description" />

      <Map
        location={classInfo.location}
        disabled={disabled.location}
        setInfo={setClassInfo}
      />
      <Edit type="location" />
    </div>
  );
};

export default Content;
