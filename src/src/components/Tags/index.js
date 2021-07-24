import React from "react";

import tagColors from "./tags.json";

import styles from "./styles.module.scss";

const Tags = ({ tags = [] }) => {
  return (
    <div className={styles.Tags}>
      {tags.map((tag, i) => (
        <div
          className={styles.tag}
          key={i}
          style={{ backgroundColor: tagColors[tag] }}
        >
          <p>{tag}</p>
        </div>
      ))}
    </div>
  );
};

export default Tags;
