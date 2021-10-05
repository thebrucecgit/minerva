import { Link } from "react-router-dom";
import { format } from "date-fns";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRedo } from "@fortawesome/free-solid-svg-icons";
import styled from "styled-components";

const StyledMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;

  ${(props) =>
    props.me
      ? `
      align-self: flex-end;
      align-items: flex-end;
      .text {
        background: var(--main-gold-color);
      }
    `
      : ""}
`;

const MessageText = styled.p`
  margin: 5px 0;
  padding: 10px;
  background: white;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
`;

const MessageRetry = styled.p`
  color: #ff0000;
  cursor: pointer;
  &:hover {
    color: darkred;
  }
`;

const MessageAuthor = styled.span`
  font-weight: 800;
`;

const MessageTime = styled.span`
  color: #222;
  margin-left: 20px;
  font-weight: normal;
`;

const SessionUpdate = styled.div`
  background: #fff;
  padding: 10px;
  margin: 10px 0;
  border-radius: 10px;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.05);
`;

export default function Message({ message, getNameById, handleRetryMessage }) {
  switch (message.type) {
    case "CREATION":
      return (
        <SessionUpdate>
          <h4>Chat created</h4>
          <p>
            Please note that this conversation may be accessed by Academe
            administrators.
          </p>
        </SessionUpdate>
      );
    case "MESSAGE":
      return (
        <StyledMessage me={message.me}>
          {message.header && (
            <p>
              <MessageAuthor>{getNameById(message.author)}</MessageAuthor>
              <MessageTime>{format(message.time, "h:mm aa")}</MessageTime>
            </p>
          )}
          <MessageText>{message.text}</MessageText>
          {message.failed && (
            <MessageRetry onClick={() => handleRetryMessage(message._id)}>
              <FontAwesomeIcon icon={faRedo} /> Message failed to send
            </MessageRetry>
          )}
        </StyledMessage>
      );
    case "NEW_SESSION":
      return (
        <SessionUpdate>
          <Link to={`/dashboard/sessions/${message.sessionId}`}>
            <h4>New Session created by {getNameById(message.author)}</h4>
            <p>{format(message.sessionTime, "d MMMM yyyy h:mm aa")}</p>
          </Link>
        </SessionUpdate>
      );
    case "NEW_SESSION_REQUEST":
      return (
        <SessionUpdate>
          <Link to={`/dashboard/sessions/${message.sessionId}`}>
            <h4>New Session requested by {getNameById(message.author)}</h4>
            <p>{format(message.sessionTime, "d MMMM yyyy h:mm aa")}</p>
          </Link>
        </SessionUpdate>
      );
    case "CANCEL_SESSION":
      return (
        <SessionUpdate>
          <Link to={`/dashboard/sessions/${message.sessionId}`}>
            <h4>Session cancelled by {getNameById(message.author)}</h4>
            <p>{format(message.sessionTime, "d MMMM yyyy h:mm aa")}</p>
          </Link>
        </SessionUpdate>
      );
    default:
      return null;
  }
}
