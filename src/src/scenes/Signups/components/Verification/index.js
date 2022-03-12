import React from "react";
import classNames from "classnames";

import StatusSymbol from "../StatusSymbol";

import styles from "../../styles.module.scss";

const Verification = ({
  sectionStatus,
  sectionClosed,
  errors,
  info,
  onChange,
  onNext,
}) => {
  return (
    <section>
      <div className={styles.header}>
        <h3>Verification</h3>
        <StatusSymbol state={sectionStatus} />
      </div>
      <div
        className={classNames(styles.body, {
          [styles.closed]: sectionClosed,
        })}
      >
        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="biography">
              {info.applyTutor ? (
                <>
                  <p>
                    Feel free to be creative, but we recommend the following:{" "}
                  </p>
                  <ul>
                    <li>Your qualifications</li>
                    <li>What you're currently studying (if you're in Uni)</li>
                    <li>
                      Clear up any ambiguity in the curricula or subjects you
                      tutor
                    </li>
                  </ul>
                  <p>
                    Eg.{" "}
                    <em>
                      I'm a third-year Economics student at the University of
                      Auckland with 2 years of tutoring experience from high
                      school. I achieved outstanding scholarships in physics,
                      chemistry, and English, and would like to help you do the
                      same! Both online and in-person options work for me. I
                      look forward to meeting you.
                    </em>
                  </p>
                </>
              ) : (
                <p>Feel free to be creative!</p>
              )}
            </label>

            {errors.biography && (
              <p className={styles.invalid}>{errors.biography}</p>
            )}
            <textarea
              name="biography"
              id="biography"
              rows="5"
              placeholder="eg. Philosophy is the essence of my life. Everyday, I wake up to the sweet sounds of Plato."
              value={info.biography ?? ""}
              onChange={onChange}
              noValidate
            ></textarea>
          </div>

          <button
            className="btn"
            onClick={onNext}
            data-test="verification-next"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default Verification;
