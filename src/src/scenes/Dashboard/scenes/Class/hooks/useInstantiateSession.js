import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useParams, useHistory } from "react-router-dom";
import { loader } from "graphql.macro";

const INSTANTIATE_SESSION = loader("../graphql/InstantiateSession.gql");

const useInstantiateSession = () => {
  const history = useHistory();

  const [instantiationError, setInstantiationError] = useState("");

  const [time, setTime] = useState(new Date());
  const [length, setLength] = useState("60");

  const [instantiateSession] = useMutation(INSTANTIATE_SESSION);

  const { id } = useParams();

  const newSession = async () => {
    try {
      const { data, error } = await instantiateSession({
        variables: {
          classId: id,
          startTime: time,
          length: parseInt(length),
        },
      });
      if (error) setInstantiationError(error.message);
      else history.push(`/dashboard/sessions/${data.instantiateSession._id}`);
    } catch (e) {
      setInstantiationError(e.message);
    }
  };

  return { time, setTime, length, setLength, newSession, instantiationError };
};

export default useInstantiateSession;
