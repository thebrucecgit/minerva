import React from "react";
import classNames from "classnames";
import { useQuery } from "@apollo/react-hooks";
import { loader } from "graphql.macro";
import { useParams, Link } from "react-router-dom";
import { format } from "date-fns";
import Error from "../../../../components/Error";
import Loader from "../../../../components/Loader";

import styles from "./styles.module.scss";

const GET_SESSIONS = loader("./graphql/GetSessions.gql");

const Attendance = () => {
  const { id } = useParams();

  const { loading, error, data } = useQuery(GET_SESSIONS, {
    variables: { id, time: new Date(0) },
  });

  if (loading) return <Loader />;
  if (error) return <Error error={error} />;

  const tuteeNames = new Map();

  for (const session of data.getClass.sessions) {
    for (const { _id, name } of session.tutees) {
      tuteeNames.set(_id, name);
    }
  }

  return (
    <div className={classNames(styles.Attendance, "container")}>
      <h2>
        Attendance for{" "}
        <Link to={`/dashboard/classes/${id}`} className="link">
          {data.getClass.name}
        </Link>
      </h2>
      <table>
        <thead>
          <tr>
            <th className={styles.rotate}></th>
            {data.getClass.sessions.map((session) => (
              <th key={session.startTime} className={styles.rotate}>
                <div>
                  <Link to={`/dashboard/sessions/${session._id}`}>
                    {format(session.startTime, "d MMMM yyyy")}
                  </Link>
                </div>
              </th>
            ))}
            <th className={styles.rotate}>
              <div>
                <span>Attendance %</span>
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from(tuteeNames).map((tutee) => {
            let attended = 0,
              total = 0;
            return (
              <tr key={tutee[0]}>
                <td>{tutee[1]}</td>
                {data.getClass.sessions.map(({ attendance, startTime }) => {
                  const t = attendance.find((a) => a.tutee === tutee[0]);
                  let symbol;
                  if (typeof t == "undefined") {
                    symbol = "-";
                  } else if (t.attended) {
                    attended++;
                    total++;
                    symbol = "X";
                  } else {
                    total++;
                    symbol = "?";
                  }
                  return <td key={startTime}>{symbol}</td>;
                })}
                <td>{Math.round((attended / total) * 100 || 0)}%</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot>
          <tr>
            <td>Attendance %</td>
            {data.getClass.sessions.map((session) => (
              <td key={session._id}>
                {(session.attendance.filter(
                  ({ tutee, attended }) => attended && tuteeNames.has(tutee)
                ).length /
                  session.attendance.length) *
                  100 || 0}
                %
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
};

export default Attendance;
