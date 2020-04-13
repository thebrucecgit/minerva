import React from "react";
import classNames from "classnames";

import StatusSymbol from "../StatusSymbol";

import styles from "../../styles.module.scss";

const Verification = ({
  sectionStatus,
  sectionClosed,
  errors,
  info,
  userType,
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
          {userType === "tutor" && (
            <div className={styles.field}>
              <label htmlFor="price">Select your price per hour? </label>
              {errors.price && <p className={styles.invalid}>{errors.price}</p>}
              <select
                name="price"
                id="price"
                value={info.price}
                onChange={onChange}
                noValidate
              >
                <option value="">--SELECT--</option>
                <option value="0">FREE</option>
                <option value="15">$15</option>
                <option value="20">$20</option>
                <option value="25">$25</option>
                <option value="30">$30</option>
              </select>
            </div>
          )}

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
              value={info.biography}
              onChange={onChange}
              noValidate
            ></textarea>
          </div>

          <div className={styles.field}>
            <label htmlFor="grades">
              Please link to a copy of your latest school grades:{" "}
            </label>
            {errors.grades && <p className={styles.invalid}>{errors.grades}</p>}
            <input
              type="text"
              name="grades"
              id="grades"
              value={info.grades}
              onChange={onChange}
              noValidate
            />
          </div>
          <button onClick={onNext}>Next</button>
        </div>
      </div>
    </section>
  );
};

export default Verification;
