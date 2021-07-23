import useDM from "../../hooks/useDM";
import { Link } from "react-router-dom";
import ProfilePicture from "../ProfilePicture";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

function Tutor({ tutor, user }) {
  const onClickReq = useDM();
  const onClick = (e) => {
    e.preventDefault();
    e.stopPropagation();
    onClickReq(tutor._id);
  };

  return (
    <div className="card">
      <Link to={`/dashboard/tutors/${tutor._id}`}>
        <ProfilePicture pfp={tutor.pfp} alt={tutor.name} />
        <div className="body">
          <h3>{tutor.name}</h3>
          {tutor._id !== user._id && (
            <FontAwesomeIcon icon={faComments} onClick={onClick} />
          )}
        </div>
      </Link>
    </div>
  );
}

export default Tutor;
