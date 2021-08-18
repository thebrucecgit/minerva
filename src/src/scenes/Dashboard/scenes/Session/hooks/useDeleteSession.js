import { toast } from "react-toastify";
import { useMutation } from "@apollo/client";
import { loader } from "graphql.macro";
import { useHistory } from "react-router-dom";
import useModal from "../../../hooks/useModal";

const DELETE_SESSION = loader("../graphql/DeleteSession.gql");

function useDeleteSession({ id, classId }) {
  const history = useHistory();

  const [deleteSessionReq] = useMutation(DELETE_SESSION);
  const [open, binds] = useModal(false);

  let toastId;

  const deleteSession = async () => {
    try {
      toastId = toast("Deleting session...", { autoClose: false });
      await deleteSessionReq({ variables: { id } });
      toast.update(toastId, {
        render: "Session successfully deleted",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
      history.replace(`/dashboard/classes/${classId}`);
    } catch (e) {
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

  return [deleteSession, open, binds];
}

export default useDeleteSession;
