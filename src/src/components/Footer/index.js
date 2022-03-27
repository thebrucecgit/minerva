import React from "react";
import { Link } from "react-router-dom";

import styles from "./styles.module.scss";

function Footer() {
  return (
    <div className={styles.Footer}>
      <div>
        <p>Copyright © 2022 Minerva Education. All Rights Reserved.</p>
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
        <Link to="/signup">
          <button className="btn">Sign up</button>
        </Link>
      </div>
    </div>
  );
}

export default Footer;
