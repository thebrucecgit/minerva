import React from "react";
import { Link } from "react-router-dom";

import academic from "../../../../media/academic.jpg";

function Academic() {
  return (
    <div>
      <div className="header">
        <h1>Academic Studies</h1>
        {/* include("../partials/google"); %*/}
      </div>
      <div className="container" id="about-us">
        <div className="col">
          <div>
            <h3>Learning</h3>
            <p>
              All subjects are offered at all school levels subject to
              availability of tutors.{" "}
            </p>
            <h3>Subjects</h3>
            <ul>
              {[
                "Mathematics",
                "English",
                "History",
                "Geography",
                "Classics",
                "Physics",
                "Biology",
                "Chemistry",
                "General Science",
                "Economics",
                "Accounting",
                "Financial Literacy",
                "...and more!"
              ].map((subject, index) => (
                <li key={index}>{subject}</li>
              ))}
            </ul>
          </div>
          <img src={academic} alt="books" />
        </div>
        <p>
          Take a look at our{" "}
          <Link to="/services/extra-curriculars">
            extra-curricular services
          </Link>
          .
        </p>
      </div>
    </div>
  );
}

export default Academic;
