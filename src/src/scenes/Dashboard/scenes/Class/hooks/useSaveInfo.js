import { toast } from "react-toastify";
import { loader } from "graphql.macro";
import { useMutation } from "@apollo/client";

const UPDATE_CLASS = loader("../graphql/UpdateClass.gql");

export default function useSaveInfo(
  id,
  setClassInfo,
  setDisabled,
  update,
  setUpdate
) {
  let toastId;
  const [updateClass] = useMutation(UPDATE_CLASS);
  const saveInfo = async (name, { resetUpdate = true } = {}) => {
    try {
      toastId = toast("Updating class...", { autoClose: false });

      setDisabled((st) => ({
        ...st,
        [name]: true,
      }));

      const variables = {
        id,
        [name]: update[name],
      };

      if (name === "description")
        variables.description = JSON.stringify(update.description);
      else if (name === "tutors")
        variables.tutors = update.tutors.map((tutor) => tutor._id);
      else if (name === "tutees")
        variables.tutees = update.tutees.map((tutee) => tutee._id);

      setClassInfo((st) => ({
        ...st,
        [name]: update[name],
      }));

      if (resetUpdate) {
        setUpdate((st) => ({
          ...st,
          [name]: "",
        }));
      }

      const { data } = await updateClass({ variables });

      data.updateClass.description = JSON.parse(data.updateClass.description);

      setClassInfo((st) => ({
        ...st,
        ...data.updateClass,
      }));

      toast.update(toastId, {
        render: "Successfully updated class",
        type: toast.TYPE.SUCCESS,
        autoClose: 3000,
      });
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };
  return saveInfo;
}
