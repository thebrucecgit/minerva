import React from "react";
import { Link } from "react-router-dom";

import extras from "../../../../media/extras.jpg";

function Extras() {
  return (
    <div>
      <div className="header">
        <h1>Extra-Curriculars</h1>
        {/* include("../partials/google"); */}
      </div>
      <div className="container" id="about-us">
        <div className="col">
          <div>
            <h3>Life Beyond School</h3>
            <p>
              School, however important, is only one part of your life. We will
              help you develop your extra-curriculars.{" "}
            </p>
            <h3>Areas</h3>
            <ul>
              {[
                "Programming",
                "Piano",
                "Violin",
                "Singing",
                "Music Theory",
                "Speech Training",
                "On Stage Direction",
                "Lighting/Sound",
                "Philosophy",
                "...and more!"
              ].map((subject, index) => (
                <li key={index}>{subject}</li>
              ))}
            </ul>
          </div>
          <img src={extras} alt="coding" />
        </div>
        <p>
          Take a look at our{" "}
          <Link to="/services/academic-studies">academic studies services</Link>
          .
        </p>
      </div>
    </div>
  );
}

export default Extras;
