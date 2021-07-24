import { Link } from "react-router-dom";
import ProfilePicture from "../ProfilePicture";
import DMButton from "../DMButton";

function Tutor({ tutor, user }) {
  return (
    <div className="card">
      <Link to={`/dashboard/tutors/${tutor._id}`}>
        <ProfilePicture pfp={tutor.pfp} alt={tutor.name} />
        <div className="body">
          <h3>{tutor.name}</h3>
          {tutor._id !== user._id && <DMButton id={tutor._id} expanded />}
        </div>
      </Link>
    </div>
  );
}

export default Tutor;
