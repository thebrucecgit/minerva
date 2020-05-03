import React from "react";
import gql from "graphql-tag";
import { useQuery } from "@apollo/react-hooks";
import ClassSection from "./components/ClassSection";

import styles from "./styles.module.scss";

const GET_CLASSES = gql`
  query GetClasses {
    getClasses {
      _id
      name
      image
    }
  }
`;

const Classes = () => {
  const { data, error, loading } = useQuery(GET_CLASSES);

  if (error) return <p className="error">{error.message}</p>;
  if (loading) return <p>Loading...</p>;

  const classes = data.getClasses;

  return (
    <div className={styles.Classes}>
      <h1>Classes</h1>
      <div className={styles.classes_grid}>
        {classes.map((classInfo) => (
          <ClassSection classInfo={classInfo} />
        ))}
      </div>
    </div>
  );
};

export default Classes;
