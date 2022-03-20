import React from "react";
import ProfilePicture from "../../components/ProfilePicture";
import { Link, useParams } from "react-router-dom";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { useQuery } from "@apollo/client";
import { loader } from "graphql.macro";
import { format } from "date-fns";
import classNames from "classnames";
import DMButton from "../../components/DMButton";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faGraduationCap, faSchool } from "@fortawesome/free-solid-svg-icons";

import Tags from "../../../../components/Tags";

import styles from "./styles.module.scss";

const GET_USER = loader("./graphql/GetUser.gql");

const User = ({ currentUser }) => {
  const { id } = useParams();

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
          <p className={styles.userType}>
            {user.yearGroup} at {user.school}
          </p>
        </div>
        <ProfilePicture pfp={user.pfp} alt={user.name} width="400" />
      </div>

      <div className={classNames("container", styles.userInfo)}>
        {currentUser.user._id !== user._id && (
          <DMButton id={user._id} expanded />
        )}

        <div>
          <h3>${user.tutor.price} per hour</h3>
        </div>

        <div>
          {user.tutor?.academicsTutoring?.length > 0 && (
            <div className={styles.tags}>
              <FontAwesomeIcon icon={faGraduationCap} size="2x" />
              <Tags tags={user.tutor.academicsTutoring} />
            </div>
          )}
        </div>

        <div>
          {user.tutor?.curricula?.length > 0 && (
            <div className={styles.tags}>
              <FontAwesomeIcon icon={faSchool} size="2x" />
              <Tags tags={user.tutor.curricula} />
            </div>
          )}
        </div>

        <h2>Biography</h2>
        <p>{user.biography}</p>

        {/* {fullAccess && (
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
        )} */}
      </div>
    </div>
  );
};

export default User;
