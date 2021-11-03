import { Link } from "react-router-dom";
import { loader } from "graphql.macro";
import { useMutation } from "@apollo/client";
import { toast } from "react-toastify";

const INDEX_TUTORS = loader("./graphql/IndexTutors.gql");

function Main() {
  const [indexTutorsReq] = useMutation(INDEX_TUTORS);

  const onIndexTutor = async () => {
    let toastId;
    try {
      toastId = toast("Reindexing...", { autoClose: false });
      await indexTutorsReq();
      toast.update(toastId, {
        render: "Success",
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

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      <Link to="/dashboard">
        <button className="btn">Dashboard</button>
      </Link>
      <Link to="/admin/review">
        <button className="btn">Review Pending Tutors</button>
      </Link>
      <button className="btn" onClick={onIndexTutor}>
        Re-index Tutors
      </button>
    </div>
  );
}

export default Main;
