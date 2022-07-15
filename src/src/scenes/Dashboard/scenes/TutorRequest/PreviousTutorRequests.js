import { loader } from "graphql.macro";
import { useQuery } from "@apollo/client";
import Loader from "components/Loader";
import Error from "components/Error";
import { format } from "date-fns";

const GET_TUTOR_REQUESTS = loader("./graphql/GET_TUTOR_REQUESTS.gql");

export default function PreviousTutorRequests({ currentUser }) {
  const { loading, error, data } = useQuery(GET_TUTOR_REQUESTS, {
    variables: { userID: currentUser.user._id },
  });

  if (loading) return <Loader />;
  if (error) return <Error error={error} />;

  if (data.getRequestsOfUser.length === 0)
    return <div>You have no current tutor requests.</div>;

  return (
    <div>
      {data.getRequestsOfUser.map((request) => (
        <div key={request._id} className="card y">
          <div className="header">
            <h4>
              {request.subject}, {request.curriculum}
            </h4>
            <p>ID: {request._id}</p>
            <p>Requested on {format(request.date, "d MMMM yyyy")}</p>
            <p>Status: {request.status}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
