import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { loader } from "graphql.macro";

const CONFIRM_SESSION = loader("../graphql/ConfirmSession.gql");
const REJECT_SESSION = loader("../graphql/RejectSession.gql");

function useRequestResponse({ setSessionInfo, id }) {
  const [confirmSessionReq] = useMutation(CONFIRM_SESSION);
  const [rejectSessionReq] = useMutation(REJECT_SESSION);

  let toastId;

  const requestResponse = async (reject) => {
    try {
      toastId = toast(`${reject ? "Rejecting" : "Confirming"} session...`);

      if (reject) {
        const { data } = await rejectSessionReq({ variables: { id } });
        setSessionInfo((st) => ({
          ...st,
          ...data.rejectSession,
        }));
      } else {
        const { data } = await confirmSessionReq({ variables: { id } });
        setSessionInfo((st) => ({
          ...st,
          ...data.confirmSession,
        }));
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

  return [requestResponse];
}

export default useRequestResponse;
