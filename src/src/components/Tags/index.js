import React from "react";

import styles from "./styles.module.scss";

const Tags = ({ tags = [], color = "#a9e4f5" }) => {
  return (
    <div className={styles.Tags}>
      {tags.map((tag, i) => (
        <div className={styles.tag} key={i} style={{ backgroundColor: color }}>
          <p>{tag}</p>
        </div>
      ))}
    </div>
  );
};

export default Tags;
