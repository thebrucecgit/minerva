import { useMutation } from "@apollo/client";
import { useState } from "react";
import ReactStars from "react-rating-stars-component";
import { loader } from "graphql.macro";
import { toast } from "react-toastify";

const REVIEW_SESSION = loader("../graphql/ReviewSession.gql");

function Review({ id, setSessionInfo }) {
  const [reviewSessionReq] = useMutation(REVIEW_SESSION);
  const [review, setReview] = useState({});

  const onHandleSubmit = async (e) => {
    e.preventDefault();
    let toastId;
    try {
      toastId = toast("Processing review...", { autoClose: false });
      const { data } = await reviewSessionReq({ variables: { id, review } });

      setSessionInfo((st) => ({
        ...st,
        review: data.reviewSession.review,
      }));

      toast.update(toastId, {
        render: "Review successful",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
    } catch (e) {
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

  return (
    <form className="alert" onSubmit={onHandleSubmit}>
      <p>How did the session go?</p>
      <div>
        {[
          "The session occurred as expected",
          "I didn't attend",
          "The tutor(s) didn't attend",
        ].map((r, i) => (
          <div className="checkbox" key={i}>
            <input
              type="radio"
              name="occurred"
              id={i}
              value={r}
              checked={r === review.occurred}
              onChange={() => setReview((st) => ({ ...st, occurred: r }))}
              required
            />
            <label htmlFor={i}>{r}</label>
          </div>
        ))}
      </div>
      {review.occurred === "I didn't attend" && (
        <>
          <p>Why did you miss the session?</p>
          <input
            type="text"
            name="reason"
            value={review.reason ?? ""}
            onChange={(e) =>
              setReview((st) => ({ ...st, reason: e.target.value }))
            }
          />
        </>
      )}
      <p>Overall quality of session: </p>
      <ReactStars
        value={review.rating}
        size={30}
        onChange={(rating) => setReview((st) => ({ ...st, rating }))}
      />
      {review.rating <= 3 && (
        <>
          <p>What could've been improved?</p>
          <textarea
            type="text"
            name="comment"
            value={review.comment ?? ""}
            onChange={(e) =>
              setReview((st) => ({ ...st, comment: e.target.value }))
            }
          ></textarea>
        </>
      )}
      <button className="btn">Submit</button>
    </form>
  );
}

export default Review;
