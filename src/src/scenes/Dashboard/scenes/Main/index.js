import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { loader } from "graphql.macro";
import { useQuery } from "@apollo/client";
import ProfilePicture from "../../components/ProfilePicture";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import SessionSummary from "scenes/Dashboard/components/SessionSummary";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

const GET_INFO = loader("./graphql/GetInfo.gql");

const Main = ({ currentUser }) => {
  const { data, loading, error } = useQuery(GET_INFO, {
    variables: { userID: currentUser.user._id },
  });

  if (error) return <Error error={error} />;
  if (loading && !data) return <Loader />;

  return (
    <div>
      <div className={styles.upper}>
        <div className={styles.wrapper}>
          <h1>Sessions</h1>
          <div className={styles.group}>
            {data.getSessionsOfUser.length > 0 ? (
              data.getSessionsOfUser.map((session) => (
                <SessionSummary
                  key={session._id}
                  session={session}
                  currentUser={currentUser}
                  onChange={(sessionInfo) => {}}
                />
              ))
            ) : (
              <p>You have no upcoming sessions.</p>
            )}
            <p>
              <Link to="/dashboard/sessions">See all</Link>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.lower}>
        <h1>Tutors</h1>
        <div className={styles.tutors}>
          {data.getTutorsOfUser.map((tutor) => (
            <Link
              className={classNames("card x square", styles.tutor)}
              key={tutor._id}
              to={`/dashboard/tutors/${tutor._id}`}
            >
              <ProfilePicture pfp={tutor.pfp} alt={tutor.name} />
              <div className="body">
                <h3>{tutor.name}</h3>
              </div>
            </Link>
          ))}
          <div
            className={classNames(
              "card x square",
              styles.tutor,
              styles.addTutor
            )}
          >
            <Link to="/dashboard/search">
              <h3>Search Tutors</h3>
              <FontAwesomeIcon icon={faPlus} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Main;
