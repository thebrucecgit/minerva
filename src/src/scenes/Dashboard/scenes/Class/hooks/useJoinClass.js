import { useMutation } from "@apollo/client";
import { loader } from "graphql.macro";
import { toast } from "react-toastify";

const JOIN_CLASS = loader("../graphql/JoinClass.gql");

export default function useJoinClass(id, setClassInfo) {
  const [joinClassReq] = useMutation(JOIN_CLASS);

  let toastId;
  const joinClass = async () => {
    try {
      toastId = toast("Joining class...", { autoClose: false });
      const { data } = await joinClassReq({ variables: { id } });

      setClassInfo((st) => ({
        ...st,
        tutees: data.joinClass.tutees,
      }));

      toast.update(toastId, {
        render: "Successfully joined class",
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
  return joinClass;
}
