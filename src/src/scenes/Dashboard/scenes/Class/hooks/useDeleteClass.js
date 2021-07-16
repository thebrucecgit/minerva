import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";
import { loader } from "graphql.macro";
import { useHistory } from "react-router";

const DELETE_CLASS = loader("../graphql/DeleteClass.gql");

export default function useDeleteClass(id) {
  const [deleteClassReq] = useMutation(DELETE_CLASS);
  const history = useHistory();
  let toastId;
  const deleteClass = async () => {
    try {
      toastId = toast("Deleting class...", { autoClose: false });
      await deleteClassReq({ variables: { id } });
      toast.update(toastId, {
        render: "Class successfully deleted",
        type: toast.TYPE.SUCCESS,
        autoClose: 2000,
      });
      history.replace("/dashboard");
    } catch (e) {
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };
  return deleteClass;
}
