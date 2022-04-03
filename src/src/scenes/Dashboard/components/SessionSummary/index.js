import { Link } from "react-router-dom";
import SessionRequestResponse from "../SessionRequestResponse";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faExclamationTriangle,
  faTimes,
  faCommentDots,
} from "@fortawesome/free-solid-svg-icons";
import { format, isAfter } from "date-fns";
import classNames from "classnames";
import styled from "styled-components";

const StyledSessionSummary = styled.div`
  max-width: 600px;
`;

export default function SessionSummary({ session, currentUser }) {
  return (
    <StyledSessionSummary
      className={classNames("card", {
        current:
          isAfter(new Date(), session.startTime) &&
          isAfter(session.endTime, new Date()),
        cancelled: session.status === "CANCEL",
      })}
    >
      <div className="header">
        <Link
          to={`/dashboard/sessions/${session._id}`}
          title={
            session.status === "UNCONFIRM"
              ? "This session is not confirmed yet."
              : ""
          }
        >
          <h2>
            {session.name}{" "}
            {session.status === "UNCONFIRM" && (
              <FontAwesomeIcon icon={faExclamationTriangle} color="#ffcc00" />
            )}
            {(session.status === "CANCEL" || session.status === "REJECT") && (
              <FontAwesomeIcon icon={faTimes} color="#ff3e3e" />
            )}
            {isAfter(new Date(), session.endTime) &&
              [...session.tuteeReviews, ...session.tutorReviews].every(
                (r) => r.user !== currentUser.user._id
              ) && <FontAwesomeIcon icon={faCommentDots} color="#ffcc00" />}
          </h2>
        </Link>
        <p>{format(session.startTime, "EEEE, d MMMM yyyy")}</p>
        <p>Run by {session.tutors.map((t) => t.name).join(", ")}</p>
        {session.userResponses.every(
          (res) => res.user !== currentUser.user._id
        ) && <SessionRequestResponse id={session._id} />}
      </div>
      <div className="body">
        <p>
          {session.settings?.online
            ? "Online"
            : session.location.address || <em>Location to be decided</em>}
        </p>
      </div>
    </StyledSessionSummary>
  );
}
