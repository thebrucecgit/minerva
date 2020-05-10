import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { loader } from "graphql.macro";
import Loader from "../../../../components/Loader";
import { Link } from "react-router-dom";
import { format } from "date-fns";

import styles from "./styles.module.scss";

const GET_SESSIONS = loader("./graphql/GetSessions.gql");

const Sessions = () => {
  const { data, error, loading } = useQuery(GET_SESSIONS);

  if (error) return <p className="error">{error.message}</p>;
  if (loading) return <Loader />;

  const sessions = data.getSessions;

  return (
    <div className={styles.Sessions}>
      <h1>Sessions</h1>
      <div className={styles.sessions_grid}>
        {sessions
          .sort((a, b) => new Date(b.time) - new Date(a.time))
          .map((session) => (
            <div>
              <div className="card">
                <div className="header">
                  <Link to={`/dashboard/sessions/${session._id}`}>
                    <h2>{format(session.time, "EEEE d MMMM, yyyy")}</h2>
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
