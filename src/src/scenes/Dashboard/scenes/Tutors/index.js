import React from "react";
import { useQuery } from "@apollo/client";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { loader } from "graphql.macro";
import Tutor from "../../components/Tutor";

import styles from "./styles.module.scss";

const GET_TUTORS = loader("./graphql/GetTutors.gql");

const Tutors = ({ currentUser }) => {
  const { data, error, loading } = useQuery(GET_TUTORS);

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const tutors = data.getTutors;

  return (
    <div className="container">
      <h1>Tutors</h1>
      <div className={styles.tutors}>
        {tutors.length ? (
          tutors.map((tutor) => (
            <Tutor tutor={tutor} key={tutor._id} user={currentUser.user} />
          ))
        ) : (
          <p>You have no tutors</p>
        )}
      </div>
    </div>
  );
};

export default Tutors;
