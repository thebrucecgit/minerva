import { NavLink } from "react-router-dom";
import { useQuery } from "@apollo/client";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { loader } from "graphql.macro";
import Tutor from "../../components/Tutor";

import styles from "./styles.module.scss";

const GET_TUTORS = loader("./graphql/GetTutors.gql");

const Tutors = ({ currentUser }) => {
  const { data, error, loading } = useQuery(GET_TUTORS, {
    variables: { userID: currentUser.user._id },
  });

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const tutors = data.getTutorsOfUser;

  return (
    <div className="container">
      <h1>Tutors</h1>
      <p>
        <NavLink to="/dashboard/search">Search for tutors</NavLink>
      </p>
      <div className={styles.tutors}>
        {tutors.length > 0 ? (
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
