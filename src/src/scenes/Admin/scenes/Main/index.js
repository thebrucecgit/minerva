import { Link } from "react-router-dom";

function Main() {
  return (
    <div>
      <h2>Admin Dashboard</h2>
      <Link to="/admin/review">
        <button className="btn">Review Pending Tutors</button>
      </Link>
    </div>
  );
}

export default Main;