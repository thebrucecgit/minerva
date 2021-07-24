import React from "react";
import classNames from "classnames";
import { Link } from "react-router-dom";

import StatusSymbol from "../StatusSymbol";

import styles from "../../styles.module.scss";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNotch } from "@fortawesome/free-solid-svg-icons";

const Confirmation = ({
  sectionStatus,
  sectionClosed,
  errors,
  info,
  onChange,
  onSubmit,
  submissionPending,
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
            <div className="checkbox">
              <input
                type="checkbox"
                name="agreement"
                id="agreement"
                checked={info.agreement ?? false}
                onChange={onChange}
                noValidate
              />
              <label htmlFor="agreement">
                I agree to the the Terms of Services and the{" "}
                <Link to="/privacy-policy" target="_BLANK">
                  Privacy Policy
                </Link>
              </label>
            </div>
          </div>
          {errors.confirmation && (
            <p className={styles.invalid}>{errors.confirmation}</p>
          )}
          <button className="btn" onClick={onSubmit}>
            Submit{" "}
            {submissionPending && <FontAwesomeIcon icon={faCircleNotch} spin />}
          </button>
        </div>
      </div>
    </section>
  );
};

export default Confirmation;
