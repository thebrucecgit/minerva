import useState from "react";
import { useMutation } from "@apollo/client";
import useModal from "../../../hooks/useModal";
import { loader } from "graphql.macro";
import { toast } from "react-toastify";

const CANCEL_SESSION = loader("../graphql/CancelSession.gql");

function useCancelSession({ id, setSessionInfo }) {
  const [cancelSessionReq] = useMutation(CANCEL_SESSION);
  const [open, binds] = useModal(false);
  const [reason, setReason] = useState("");

  let toastId;
  const cancelSession = async (e) => {
    e.preventDefault();
    try {
      toastId = toast("Cancelling session...", {
        autoClose: false,
      });
      const { data } = await cancelSessionReq({
        variables: { id, reason },
      });
      setSessionInfo((info) => ({
        ...info,
        ...data.cancelSession,
      }));
      binds.onClose();
      toast.update(toastId, {
        render: "Session successfully cancelled",
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

  const onReasonChange = (e) => setReason(e.target.value);

  return [cancelSession, open, binds, reason, onReasonChange];
}

export default useCancelSession;
