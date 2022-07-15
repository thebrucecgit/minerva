import { useState } from "react";
import { Link } from "react-router-dom";
import TutorRequestForm from "scenes/Dashboard/components/TutorRequestForm";
import PreviousTutorRequests from "./PreviousTutorRequests";
import { useApolloClient, useMutation } from "@apollo/client";
import { loader } from "graphql.macro";
import { toast } from "react-toastify";

const GET_TUTOR_REQUESTS = loader("./graphql/GET_TUTOR_REQUESTS.gql");
const CREATE_TUTOR_REQUEST = loader("./graphql/CREATE_TUTOR_REQUEST.gql");

export default function TutorRequest({ currentUser }) {
  const [info, setInfo] = useState({});
  const client = useApolloClient();
  const [createRequest] = useMutation(CREATE_TUTOR_REQUEST);
  const [error, setError] = useState(null);

  const onChange = (e) => {
    setInfo((st) => ({ ...st, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    let toastId = toast("Submitting...", { autoClose: false });
    try {
      const { data } = await createRequest({ variables: info });
      client.writeQuery({
        query: GET_TUTOR_REQUESTS,
        data: {
          getRequestsOfUser: [data.createTutorRequest],
        },
        variables: {
          userID: currentUser.user._id,
        },
      });
      setInfo({});
      setError(null);
      toast.update(toastId, {
        render: "Request is successful",
        type: toast.TYPE.SUCCESS,
        autoClose: 3000,
      });
    } catch (e) {
      toast.dismiss(toastId);
      setError(e.message);
    }
  };

  return (
    <div className="container">
      <h1>Request a tutor</h1>
      <p>
        Can't find a suitable tutor through{" "}
        <Link to="/dashboard/search">Search</Link> or don't want to choose? Let
        us match a tutor with you.
      </p>
      <p>
        You will still be able to decline after we find a match. We can't
        guarantee we will be able to fully meet your preferences.
      </p>
      <form onSubmit={handleSubmit}>
        <p className="error">{error}</p>
        <TutorRequestForm info={info} onChange={onChange} />
        <button className="btn">Submit</button>
      </form>
      <hr />
      <h2>Previous requests</h2>
      <PreviousTutorRequests currentUser={currentUser} />
    </div>
  );
}
