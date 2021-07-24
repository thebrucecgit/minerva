import React from "react";
import ProfilePicture from "../../components/ProfilePicture";
import { Link, useParams } from "react-router-dom";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { useQuery } from "@apollo/client";
import { loader } from "graphql.macro";
import { format } from "date-fns";
import classNames from "classnames";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faRunning } from "@fortawesome/free-solid-svg-icons";

import Tags from "../../components/Tags";

import styles from "./styles.module.scss";

const GET_USER_FULL = loader("./graphql/GetUserFull.gql");
const GET_USER_LIMITED = loader("./graphql/GetUserLimited.gql");

const User = ({ currentUser }) => {
  const { id } = useParams();

  // const fullAccess = currentUser.user._id === id;
  const fullAccess = false;

  const GET_USER = fullAccess ? GET_USER_FULL : GET_USER_LIMITED;

  const { data, error, loading } = useQuery(GET_USER, { variables: { id } });

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const user = data.getUser;

  return (
    <div className={styles.User}>
      <div className={styles.header}>
        <div className={styles.bar}>
          <h1>
            {user.name.split(" ").map((s, i) => (
              <div key={i}>{s}</div>
            ))}
          </h1>
          <p className={styles.userType}>{`${
            user.tutor.status === "COMPLETE" ? "Tutor, " : ""
          }Year ${user.yearGroup}`}</p>
        </div>
        <ProfilePicture pfp={user.pfp} alt={user.name} width="400" />
      </div>

      <div className={classNames("container", styles.userInfo)}>
        <div>
          {user.academicsLearning.length > 0 && (
            <div className={styles.tags}>
              <FontAwesomeIcon icon={faGraduationCap} size="2x" />
              <Tags tags={user.academicsLearning} />
            </div>
          )}
          {user.extrasLearning.length > 0 && (
            <div className={styles.tags}>
              <FontAwesomeIcon icon={faRunning} size="2x" />
              <Tags tags={user.extrasLearning} />
            </div>
          )}
          {user.academicsTutoring.length > 0 && (
            <div className={styles.tags}>
              <FontAwesomeIcon icon={faGraduationCap} size="2x" />
              <Tags tags={user.academicsTutoring} />
            </div>
          )}
          {user.extrasTutoring.length > 0 && (
            <div className={styles.tags}>
              <FontAwesomeIcon icon={faRunning} size="2x" />
              <Tags tags={user.extrasTutoring} />
            </div>
          )}
        </div>

        <h2>Biography</h2>
        <p>{user.biography}</p>

        {fullAccess && (
          <>
            <h2>Classes</h2>
            <div className={styles.classes}>
              {user.classes.length ? (
                user.classes.map((classInfo, i) => (
                  <div key={i} className="card">
                    <Link to={`/dashboard/classes/${classInfo._id}`}>
                      <img src={classInfo.image} alt="" />
                      <div className="body">
                        <h3>{classInfo.name}</h3>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p>This user has no classes.</p>
              )}
            </div>

            <h2>Sessions</h2>
            <div className={styles.sessions}>
              {user.sessions.length ? (
                user.sessions.map((session, i) => (
                  <div key={i} className="card">
                    <Link to={`/dashboard/sessions/${session._id}`}>
                      <div className="body">
                        <h3>
                          {format(session.startTime, "EEEE, d MMMM yyyy")}
                        </h3>
                        <p>{format(session.startTime, "h:mm aa")}</p>
                      </div>
                    </Link>
                  </div>
                ))
              ) : (
                <p>This user has no sessions.</p>
              )}
            </div>
          </>
        )}

        <p>
          <a
            target="_blank"
            rel="noopener noreferrer"
            href={`mailto:${user.email}`}
          >
            {user.email}
          </a>
        </p>
      </div>
    </div>
  );
};

export default User;
