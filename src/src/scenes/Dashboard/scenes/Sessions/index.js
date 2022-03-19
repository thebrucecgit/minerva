import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { loader } from "graphql.macro";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { Link } from "react-router-dom";
import { format, isAfter } from "date-fns";
import classNames from "classnames";

import styles from "./styles.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faTimesCircle,
  faCheckCircle,
  faExclamationTriangle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";

const GET_SESSIONS = loader("./graphql/GetSessions.gql");

const Sessions = ({ currentUser }) => {
  const [isOld, setIsOld] = useState(false);

  // Solely for re-rendering purposes
  const [, setCounter] = useState(0);

  const { data, error, loading, refetch } = useQuery(GET_SESSIONS, {
    variables: { userID: currentUser.user._id, old: isOld },
  });

  useEffect(() => {
    if (data && !isOld) {
      const timeoutIds = [];
      data.getSessionsOfUser.forEach((session) => {
        // When a session finishes, refetch
        const timeTillEnd = new Date(session.endTime) - new Date();
        if (timeTillEnd < 2 ** 31) {
          const refetchId = setTimeout(() => {
            refetch();
          }, timeTillEnd);
          timeoutIds.push(refetchId);
        }

        // When a session starts, re-render
        if (isAfter(session.startTime, new Date())) {
          const refreshId = setTimeout(() => {
            setCounter((st) => st + 1);
          }, new Date(session.startTime) - new Date());
          timeoutIds.push(refreshId);
        }
      });
      return () => {
        timeoutIds.forEach((id) => clearTimeout(id));
      };
    }
  }, [data, isOld, refetch]);

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  const sessions = data.getSessionsOfUser;

  return (
    <div className={styles.Sessions}>
      <h1>Sessions</h1>

      <form>
        <div className="checkbox">
          <input
            type="checkbox"
            name="isOld"
            id="isOld"
            checked={isOld}
            onChange={(e) => setIsOld(e.target.checked)}
          />
          <label htmlFor="isOld">View old sessions</label>
        </div>
      </form>

      <div className={styles.sessions_grid}>
        {sessions.length ? (
          sessions
            .filter((session) => session.status !== "REJECT")
            .map((session) => (
              <div key={session._id}>
                <div
                  className={classNames("card", {
                    current:
                      !isOld &&
                      isAfter(new Date(), session.startTime) &&
                      isAfter(session.endTime, new Date()),
                    cancelled: session.status === "CANCEL",
                  })}
                >
                  <div className="header">
                    <Link
                      to={`/dashboard/sessions/${session._id}`}
                      title={
                        session.status === "UNCONFIRM"
                          ? "This session is not confirmed yet."
                          : ""
                      }
                    >
                      <h2>
                        {format(session.startTime, "EEEE, d MMMM yyyy")}{" "}
                        {session.status === "UNCONFIRM" && (
                          <FontAwesomeIcon
                            icon={faExclamationTriangle}
                            className={styles.unconfirmed}
                          />
                        )}
                        {session.status === "CANCEL" && (
                          <FontAwesomeIcon icon={faTimes} />
                        )}
                        {isOld &&
                          session.tutees.some(
                            (s) => s._id === currentUser.user._id
                          ) && (
                            <FontAwesomeIcon
                              className={classNames(styles.attended, {
                                [styles.true]: session.attendance.length,
                              })}
                              icon={
                                session.attendance.length
                                  ? faCheckCircle
                                  : faTimesCircle
                              }
                            />
                          )}
                      </h2>
                    </Link>
                    <div className={styles.description}>
                      Run by {session.tutors.map((t) => t.name).join(", ")}
                    </div>
                  </div>
                  <div className="body">
                    <p>{session.location.address}</p>
                  </div>
                </div>
              </div>
            ))
        ) : (
          <p>You have no upcoming sessions.</p>
        )}
      </div>
    </div>
  );
};

export default Sessions;
