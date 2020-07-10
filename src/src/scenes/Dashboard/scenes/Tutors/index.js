import React from "react";
import ProfilePicture from "../../components/ProfilePicture";
import { useQuery } from "@apollo/react-hooks";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { loader } from "graphql.macro";
import { Link } from "react-router-dom";

import styles from "./styles.module.scss";

const GET_TUTORS = loader("./graphql/GetTutors.gql");

const Tutors = () => {
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
            <div className="card" key={tutor._id}>
              <Link to={`/dashboard/tutors/${tutor._id}`}>
                <ProfilePicture pfp={tutor.pfp} alt={tutor.name} />
                <div className="body">
                  <h3>{tutor.name}</h3>
                </div>
              </Link>
            </div>
          ))
        ) : (
          <p>You have no tutors</p>
        )}
      </div>
    </div>
  );
};

export default Tutors;
