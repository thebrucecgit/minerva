import React, { useEffect } from "react";
import { useQuery } from "@apollo/react-hooks";
import { loader } from "graphql.macro";

const GET_SESSIONS = loader("./graphql/GetSessions.gql");

const Attendance = () => {
  const { loading, error, data } = useQuery(GET_SESSIONS);

  useEffect(() => {
    if (data) {
      const { tutees, attendance } = data.getClass.sessions;
    }
  }, [data]);

  if (loading) return <Loader />;
  if (error) return <p className="error">{error.message}</p>;

  return <div></div>;
};

export default Attendance;
