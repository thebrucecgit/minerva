import React from "react";
import { Link, useParams } from "react-router-dom";
import Loader from "../../../../components/Loader";
import { useQuery } from "@apollo/react-hooks";
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

  const fullAccess =
    currentUser.user.userType === "TUTOR" || currentUser.user._id === id;

  const GET_USER = fullAccess ? GET_USER_FULL : GET_USER_LIMITED;

  const { data, error, loading } = useQuery(GET_USER, { variables: { id } });

  if (error) return <p className="error">{error.message}</p>;
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
          <p
            className={styles.userType}
          >{`${user.userType.toLowerCase()}, Year ${user.yearGroup}`}</p>
        </div>
        <img src={user.pfp} alt="" />
      </div>

      <div className={classNames("container", styles.userInfo)}>
        <div>
          {user.academics.length > 0 && (
            <div className={styles.tags}>
              <FontAwesomeIcon icon={faGraduationCap} size="2x" />
              <Tags tags={user.academics} />
            </div>
          )}
          {user.extras.length > 0 && (
            <div className={styles.tags}>
              <FontAwesomeIcon icon={faRunning} size="2x" />
              <Tags tags={user.extras} />
            </div>
          )}
        </div>

        <h2>Bio</h2>
        <p>{user.biography}</p>

        {fullAccess && (
          <>
            <h2>Classes</h2>
            <div className={styles.classes}>
              {user.classes.map((classInfo, i) => (
                <div key={i} className="card x">
                  <Link to={`/dashboard/classes/${classInfo._id}`}>
                    <img src={classInfo.image} alt="" />
                    <div className="body">
                      <h3>{classInfo.name}</h3>
                    </div>
                  </Link>
                </div>
              ))}
            </div>

            <h2>Sessions</h2>
            <div className={styles.classes}>
              {user.sessions.map((session, i) => (
                <div key={i} className="card x">
                  <Link to={`/dashboard/sessions/${session._id}`}>
                    <div className="body">
                      <h3>{format(session.time, "EEEE d MMMM, yyyy")}</h3>
                      <p>{format(session.time, "h:mm aa")}</p>
                    </div>
                  </Link>
                </div>
              ))}
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
