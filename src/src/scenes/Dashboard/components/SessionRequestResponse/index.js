import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { loader } from "graphql.macro";
import styled from "styled-components";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";

const CONFIRM_SESSION = loader("./graphql/ConfirmSession.gql");
const REJECT_SESSION = loader("./graphql/RejectSession.gql");

const StyledResponse = styled.div`
  display: flex;
  > button {
    margin-right: 1rem;
  }
`;

export default function SessionRequestResponse({ onChange = () => {}, id }) {
  const [confirmSessionReq] = useMutation(CONFIRM_SESSION);
  const [rejectSessionReq] = useMutation(REJECT_SESSION);

  let toastId;

  const requestResponse = async (reject) => {
    try {
      toastId = toast(`${reject ? "Rejecting" : "Confirming"} session...`);

      if (reject) {
        const { data } = await rejectSessionReq({ variables: { id } });
        onChange(data.rejectSession);
      } else {
        const { data } = await confirmSessionReq({ variables: { id } });
        onChange(data.confirmSession);
      }

      toast.update(toastId, {
        render: `Successfully ${reject ? "rejected" : "confirmed"} session`,
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
    <StyledResponse>
      <button
        className="btn"
        name="confirm"
        onClick={() => requestResponse(false)}
      >
        Confirm <FontAwesomeIcon icon={faCheck} />
      </button>
      <button className="btn danger" onClick={() => requestResponse(true)}>
        Reject <FontAwesomeIcon icon={faTimes} />
      </button>
    </StyledResponse>
  );
}
