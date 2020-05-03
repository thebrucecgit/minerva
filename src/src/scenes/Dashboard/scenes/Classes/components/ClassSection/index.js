import React from "react";
import { Link } from "react-router-dom";

import styles from "./styles.module.scss";

const ClassSection = ({ classInfo: { _id, name, image } }) => {
  return (
    <div className={styles.ClassSection}>
      <img src={image} alt="" />
      <Link to={`/dashboard/classes/${_id}`}>
        <h2>{name}</h2>
      </Link>
    </div>
  );
};

export default ClassSection;
