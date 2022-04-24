import { useQuery, useMutation } from "@apollo/client";
import { loader } from "graphql.macro";
import Tags from "components/Tags";
import { toast } from "react-toastify";
import FileManager from "components/FileManager";
import styled from "styled-components";
import { Link } from "react-router-dom";

const GET_TUTORS = loader("./graphql/GET_TUTORS.gql");
const REVIEW_TUTOR = loader("./graphql/REVIEW_TUTOR.gql");

const StyledTutor = styled.div`
  padding: 1rem;
  margin: 1rem 0;
  background: #eee;
`;

const Options = styled.div`
  display: flex;
  column-gap: 1rem;
`;

function Review() {
  const { data, loading, error } = useQuery(GET_TUTORS);

  const [reviewUserReq] = useMutation(REVIEW_TUTOR);

  const onClick = async (id, approval) => {
    let toastId;
    try {
      toastId = toast("Sending review...", { autoClose: false });
      await reviewUserReq({ variables: { id, approval } });
      toast.update(toastId, {
        render: "Success",
        type: toast.TYPE.SUCCESS,
        autoClose: 3000,
      });
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

  if (error) return <p>{error.message}</p>;

  return (
    <div className="container">
      <h2>Review Tutors</h2>
      <Link to="/admin" className="link">
        Back to admin dashboard
      </Link>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div>
          {data.getPendingTutors
            .filter((tutor) => tutor.tutor.status === "PENDING_REVIEW")
            .map((tutor) => (
              <StyledTutor key={tutor._id}>
                <h3>
                  {tutor.name} / {tutor.yearGroup} / {tutor.school}
                </h3>
                <h4>Biography</h4>
                <p>{tutor.biography}</p>

                <h4>Location</h4>
                <p>{tutor.tutor.location ?? "None"}</p>
                <p>
                  {tutor.tutor.online
                    ? "Does tutor online"
                    : "Does NOT tutor online"}
                </p>

                <h4>Tutoring</h4>
                <Tags tags={tutor.tutor.academicsTutoring} />
                <h4>Curricula</h4>
                <Tags tags={tutor.tutor.curricula} />
                <h4>Academic Records:</h4>
                <FileManager files={tutor.tutor.academicRecords} />
                <Options>
                  <button
                    className="btn"
                    onClick={() => onClick(tutor._id, true)}
                  >
                    Accept
                  </button>
                  <button
                    className="btn danger"
                    onClick={() => onClick(tutor._id, false)}
                  >
                    Reject
                  </button>
                </Options>
              </StyledTutor>
            ))}
        </div>
      )}
    </div>
  );
}

export default Review;
