import { useState } from "react";
import { useMutation } from "@apollo/client";
import { useParams, useHistory } from "react-router-dom";
import { loader } from "graphql.macro";
import { toast } from "react-toastify";

const INSTANTIATE_SESSION = loader("../graphql/InstantiateSession.gql");

const useInstantiateSession = () => {
  const history = useHistory();

  const [instantiationError, setInstantiationError] = useState("");

  const [time, setTime] = useState(new Date());
  const [length, setLength] = useState("60");

  const [instantiateSession] = useMutation(INSTANTIATE_SESSION);

  const { id } = useParams();
  const newSession = async () => {
    let toastId;
    try {
      toastId = toast("Instantiating session...", { autoClose: false });
      const { data } = await instantiateSession({
        variables: {
          classId: id,
          startTime: time,
          length: parseInt(length),
        },
      });
      toast.update(toastId, {
        render: "Successfully instantiated session",
        type: toast.TYPE.SUCCESS,
        autoClose: 3000,
      });
      history.push(`/dashboard/sessions/${data.instantiateSession._id}`);
    } catch (e) {
      toast.dismiss(toastId);
      setInstantiationError(e.message);
    }
  };

  return { time, setTime, length, setLength, newSession, instantiationError };
};

export default useInstantiateSession;
