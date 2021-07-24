import { useQuery, useMutation } from "@apollo/client";
import { loader } from "graphql.macro";
import styles from "./styles.module.scss";
import classNames from "classnames";
import Tags from "../../../../components/Tags";
import { toast } from "react-toastify";

const GET_TUTORS = loader("./graphql/GET_TUTORS.gql");
const REVIEW_TUTOR = loader("./graphql/REVIEW_TUTOR.gql");

function Review() {
  const { data, loading, error } = useQuery(GET_TUTORS);

  const [reviewUserReq] = useMutation(REVIEW_TUTOR);

  const onClick = async (id, approval) => {
    try {
      const res = await reviewUserReq({ variables: { id, approval } });
      console.log(res);
      toast.success("Success.");
    } catch (e) {
      console.error(e);
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
              <p>
                Grades:{" "}
                <a href={tutor.tutor.grades} target="_blank" rel="noreferrer">
                  {tutor.tutor.grades}
                </a>
              </p>

              <p>Learning:</p>
              <Tags tags={tutor.academicsLearning} />
              <Tags tags={tutor.extrasLearning} />
              <p>Tutoring:</p>
              <Tags tags={tutor.academicsTutoring} />
              <Tags tags={tutor.extrasTutoring} />

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