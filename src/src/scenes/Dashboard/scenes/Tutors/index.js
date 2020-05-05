import React from "react";
import { useQuery } from "@apollo/react-hooks";
import Loader from "../../../../components/Loader";
import gql from "graphql-tag";
import { Link } from "react-router-dom";

import styles from "./styles.module.scss";

const GET_TUTORS = gql`
  query {
    getTutors {
      _id
      name
      pfp
    }
  }
`;

const Tutors = () => {
  const { data, error, loading } = useQuery(GET_TUTORS);

  if (error) return <p className="error">{error.message}</p>;
  if (loading) return <Loader />;

  const tutors = data.getTutors;

  return (
    <div className="container">
      <h1>Tutors</h1>
      <div className={styles.tutors}>
        {tutors.map((tutor) => (
          <div className="card" key={tutor._id}>
            <Link to={`/dashboard/tutors/${tutor._id}`}>
              <img src={tutor.pfp} alt="" />
              <div className="body">
                <h3>{tutor.name}</h3>
              </div>
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Tutors;
