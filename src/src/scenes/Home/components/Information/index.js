import React from "react";
import classNames from "classnames";
import styles from "./styles.module.scss";

import deskStudying from "./images/desk-studying.jpg";

function Information() {
  return (
    <section className={styles.Information}>
      <div className={classNames("container", styles.container)}>
        <h2>Tutoring Redefined</h2>
        <div className={styles.row}>
          <div>
            <p>
              We know that it is not always easy to succeed in your studies with
              only what is taught in class. That's why Academe is here to help.
              We will connect you with the best students, who have experienced
              the same courses as you, and understand what is truly required for
              success. Our extensive list of studies caters for almost everyone.
            </p>
            <p>
              Or perhaps you are perfectly fine with your academic studies, and
              want to expand your abilities. We cover that too. From music, to
              coding, to philosophy and more, we have competent people to help
              you hear as well. Take a look at our extra-curricular studies menu
              to see what it is we have that interests you.
            </p>
            <a href="/about-us">
              <button className="btn">Learn more</button>
            </a>
          </div>
          <img src={deskStudying} alt="Studying on desk" />
        </div>
      </div>
    </section>
  );
}

export default Information;
