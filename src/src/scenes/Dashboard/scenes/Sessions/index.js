import React from "react";
import { useQuery } from "@apollo/react-hooks";
import { loader } from "graphql.macro";
import Loader from "../../../../components/Loader";

import SessionSection from "./components/SessionSection";

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
            <SessionSection session={session} key={session._id} />
          ))}
      </div>
    </div>
  );
};

export default Sessions;
