import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { loader } from "graphql.macro";
import Loader from "../../../../components/Loader";
import { Link } from "react-router-dom";
import { format, isAfter } from "date-fns";
import classNames from "classnames";

import styles from "./styles.module.scss";

const GET_SESSIONS = loader("./graphql/GetSessions.gql");

const Sessions = () => {
  const [isOld, setIsOld] = useState(false);

  // Solely for re-rendering purposes
  const [, setCounter] = useState(0);

  const { data, error, loading, refetch } = useQuery(GET_SESSIONS, {
    variables: { old: isOld },
  });

  useEffect(() => {
    if (data && !isOld) {
      const timeoutIds = [];
      data.getSessions.forEach((session) => {
        // When a session finishes, refetch
        const refetchId = setTimeout(() => {
          refetch();
        }, new Date(session.endTime) - new Date());
        timeoutIds.push(refetchId);

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
  }, [data]);

  if (error) return <p className="error">{error.message}</p>;
  if (loading) return <Loader />;

  const sessions = data.getSessions;

  return (
    <div className={styles.Sessions}>
      <h1>Sessions</h1>
      {
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
      }
      <div className={styles.sessions_grid}>
        {sessions
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .map((session) => (
            <div key={session._id}>
              <div
                className={classNames("card", {
                  current:
                    !isOld &&
                    isAfter(new Date(), session.startTime) &&
                    isAfter(session.endTime, new Date()),
                })}
              >
                <div className="header">
                  <Link to={`/dashboard/sessions/${session._id}`}>
                    <h2>{format(session.startTime, "EEEE d MMMM, yyyy")}</h2>
                  </Link>
                </div>
                <div className="body">
                  <p>{session.location.address}</p>
                </div>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
};

export default Sessions;
