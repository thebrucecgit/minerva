import React, { useState, useEffect } from "react";
import { useQuery } from "@apollo/client";
import { loader } from "graphql.macro";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { isAfter } from "date-fns";
import styled from "styled-components";
import mediaQuery from "styles/sizes";
import styles from "./styles.module.scss";
import SessionSummary from "../../components/SessionSummary";

const GET_SESSIONS = loader("./graphql/GetSessions.gql");

const SessionsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  grid-gap: 3rem;
  ${mediaQuery("md")`
    grid-template-columns: repeat(2, 1fr);
  `}
  ${mediaQuery("xl")`
    grid-template-columns: repeat(3, 1fr);
  `}
`;

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

  if (!data) {
    console.log(data);
  }
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

      <SessionsGrid>
        {sessions.length ? (
          sessions.map((session) => (
            <SessionSummary
              key={session._id}
              session={session}
              currentUser={currentUser}
            />
          ))
        ) : (
          <p>You have no upcoming sessions.</p>
        )}
      </SessionsGrid>
    </div>
  );
};

export default Sessions;
