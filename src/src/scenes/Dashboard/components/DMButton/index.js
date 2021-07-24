import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";
import { useMutation } from "@apollo/client";
import { loader } from "graphql.macro";
import { toast } from "react-toastify";
import { useHistory } from "react-router-dom";

const CREATE_CHAT = loader("../../graphql/CreateChat.gql");

function DMButton({ id, expanded = false }) {
  const [createChatReq] = useMutation(CREATE_CHAT);
  const history = useHistory();

  const onClick = async (e) => {
    e.stopPropagation();
    e.preventDefault();
    let toastId;
    try {
      toastId = toast("Joining chat...", { autoClose: false });
      const { data } = await createChatReq({ variables: { targets: [id] } });
      toast.dismiss(toastId);
      history.push(`/dashboard/chats/${data.createChat.channel}`);
    } catch (e) {
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  };

  return (
    <button className="btn small" onClick={onClick}>
      <FontAwesomeIcon icon={faComments} /> {expanded && "Message"}
    </button>
  );
}

export default DMButton;
