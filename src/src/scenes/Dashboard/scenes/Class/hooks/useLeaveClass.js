import { toast } from "react-toastify";
import { useHistory } from "react-router";
import { loader } from "graphql.macro";
import { useMutation } from "@apollo/client";

const LEAVE_CLASS = loader("../graphql/LeaveClass.gql");

export default function useLeaveClass(id) {
  const history = useHistory();
  const [leaveClassReq] = useMutation(LEAVE_CLASS);
  let toastId;
  const leaveClass = async () => {
    try {
      toastId = toast("Leaving class...", { autoClose: false });
      await leaveClassReq({ variables: { id } });
      toast.update(toastId, {
        render: "Left class successfully.",
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
  return leaveClass;
}
