import React from "react";
import classNames from "classnames";

import StatusSymbol from "../StatusSymbol";

import styles from "../../styles.module.scss";

const Confirmation = ({
  sectionStatus,
  sectionClosed,
  errors,
  info,
  onChange,
  onSubmit,
}) => {
  return (
    <section>
      <div className={styles.header}>
        <h3>Confirmation</h3>
        <StatusSymbol state={sectionStatus} />
      </div>
      <div
        className={classNames(styles.body, {
          [styles.closed]: sectionClosed,
        })}
      >
        <div className={styles.content}>
          <div className={styles.field}>
            {errors.agreement && (
              <p className={styles.invalid}>{errors.agreement}</p>
            )}
            <div className={styles.checkbox}>
              <input
                type="checkbox"
                name="agreement"
                id="agreement"
                checked={info.agreement}
                onChange={onChange}
                noValidate
              />
              <label htmlFor="agreement">
                I agree to the the Terms of Services and the Privacy Policy
              </label>
            </div>
          </div>
          {errors.confirmation && (
            <p className={styles.invalid}>{errors.confirmation}</p>
          )}
          <button onClick={onSubmit}>Submit</button>
        </div>
      </div>
    </section>
  );
};

export default Confirmation;
