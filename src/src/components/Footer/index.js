import React from "react";
import { Link } from "react-router-dom";

import styles from "./styles.module.scss";

function Footer() {
  return (
    <div className={styles.Footer}>
      <div>
        <p>Copyright © 2019-2021 Academe. All Rights Reserved.</p>
        <p>
          Website Developed by{" "}
          <a
            href="https://thebrucecweb.com"
            target="_blank"
            rel="noopener noreferrer"
          >
            Bruce Chen
          </a>
        </p>
        <Link to="/services">
          <button className="btn secondary">I want to get tutored</button>
        </Link>
      </div>
      <div>
        <h6>Company</h6>
        <p>
          <Link to="/about-us">About Us</Link>
        </p>
        <p>
          <Link to="/privacy-policy">Privacy Policy</Link>
        </p>
        <p>
          <Link to="/terms-of-service">Terms of Service</Link>
        </p>
      </div>
      <div>
        <h6>Services</h6>
        <p>
          <Link to="/services">Overview</Link>
        </p>
        <p>
          <Link to="/services/academic-studies">Academic Studies</Link>
        </p>
        <p>
          <Link to="/services/extra-curriculars">Extra-Curriculars</Link>
        </p>
      </div>
      <div>
        <h6>Tutors</h6>
        <p>
          <Link to="/tutors">Tutors</Link>
        </p>
      </div>
    </div>
  );
}

export default Footer;
