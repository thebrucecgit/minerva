import { useQuery, useMutation } from "@apollo/client";
import { loader } from "graphql.macro";
import styles from "./styles.module.scss";
import classNames from "classnames";
import Tags from "components/Tags";
import { toast } from "react-toastify";
import FileManager from "components/FileManager";

const GET_TUTORS = loader("./graphql/GET_TUTORS.gql");
const REVIEW_TUTOR = loader("./graphql/REVIEW_TUTOR.gql");

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
    <div className={classNames("container", styles.Review)}>
      <h2>Review Tutors</h2>
      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className={styles.tutor}>
          {data.getPendingTutors.map((tutor) => (
            <div key={tutor._id}>
              <h3>
                {tutor.name} / Year {tutor.yearGroup} / {tutor.school}
              </h3>
              <p>{tutor.biography}</p>
              <p>Academic Records:</p>
              <FileManager files={tutor.tutor.academicRecords} />

              <p>Tutoring:</p>
              <Tags tags={tutor.tutor.academicsTutoring} />

              <div className={styles.options}>
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
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Review;
