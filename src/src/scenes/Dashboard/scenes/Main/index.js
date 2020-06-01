import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";
import { loader } from "graphql.macro";
import { useQuery } from "@apollo/react-hooks";
import { format } from "date-fns";
import Loader from "../../../../components/Loader";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus } from "@fortawesome/free-solid-svg-icons";

import styles from "./styles.module.scss";

const GET_INFO = loader("./graphql/GetInfo.gql");

const Main = () => {
  const { data, loading, error } = useQuery(GET_INFO);

  if (error) return <p className="error">{error.message}</p>;
  if (loading && !data) return <Loader />;

  return (
    <div>
      <div className={styles.upper}>
        <div className={styles.wrapper}>
          <h1>Sessions</h1>
          <div className={styles.group}>
            {data.getSessions.length ? (
              data.getSessions.map((session) => (
                <Link
                  to={`/dashboard/sessions/${session._id}`}
                  key={session._id}
                  className="card square y"
                >
                  <div className="body">
                    <h2>{format(session.startTime, "d MMMM, yyyy")}</h2>
                    <h3>{format(session.startTime, "h:mm aa")}</h3>
                    <p>{session.location.address}</p>
                  </div>
                </Link>
              ))
            ) : (
              <p>You have no upcoming sessions.</p>
            )}
            <p>
              <Link to="/dashboard/sessions">See all</Link>
            </p>
          </div>
        </div>
        <div className={styles.wrapper}>
          <h1>Class</h1>
          <div className={styles.group}>
            {data.getClasses.length ? (
              data.getClasses.map((classInfo) => (
                <Link
                  to={`/dashboard/classes/${classInfo._id}`}
                  key={classInfo._id}
                  className="card square y"
                >
                  <img src={classInfo.image} alt={classInfo.name} />
                  <div className="body">
                    <h2>{classInfo.name}</h2>
                  </div>
                </Link>
              ))
            ) : (
              <p>You are not part of any class.</p>
            )}
            <p>
              <Link to="/dashboard/classes">See all</Link>
            </p>
          </div>
        </div>
      </div>
      <div className={styles.lower}>
        <h1>Tutors</h1>
        <div className={styles.tutors}>
          {data.getTutors.map((tutor) => (
            <Link
              className={classNames("card x square", styles.tutor)}
              key={tutor._id}
              to={`/dashboard/tutors/${tutor._id}`}
            >
              <img src={tutor.pfp} alt={tutor.name} />
              <div className="body">
                <h3>{tutor.name}</h3>
              </div>
            </Link>
          ))}
          <div className={styles.tutor}>
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
