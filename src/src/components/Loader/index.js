import React from "react";

import styles from "./styles.module.scss";

const Loader = () => {
  return (
    <div className={styles.cubeWrapper}>
      <div className={styles.skCubeGrid}>
        {[...Array(9)].map((_, i) => (
          <div className={styles[`skCube${i + 1}`]} key={i}></div>
        ))}
      </div>
    </div>
  );
};

export default Loader;
