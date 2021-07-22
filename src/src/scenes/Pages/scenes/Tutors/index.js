import React from "react";
import { Link } from "react-router-dom";

const Tutors = () => {
  return (
    <div>
      <div className="header">
        <h1>Tutoring Others</h1>
      </div>
      <div className="container">
        <p>
          As a tutor you are given the intellectual freedom to cater to both the
          student and your own academic interests. With your resúme we will
          promote you to students looking for your specialist subjects hopefully
          setting you up with a secure financial source through a tutee.
        </p>
        <p>
          When you sign up, there will be specific settings catered to you,
          making your tutoring experience most maximized as possible for your
          individual needs. A terms and conditions will need to be signed, but
          overall academe will not interfere much in your individual teaching
          style, nor your material content.
        </p>
        <Link to="/signup/tutors">
          <button className="btn">Sign Up As A Tutor Now!</button>
        </Link>
      </div>
    </div>
  );
};

export default Tutors;
