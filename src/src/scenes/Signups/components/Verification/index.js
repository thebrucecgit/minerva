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
              Please write a little bit about yourself
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
