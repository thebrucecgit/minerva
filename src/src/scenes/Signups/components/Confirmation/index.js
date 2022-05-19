import React from "react";

import StatusSymbol from "../StatusSymbol";

import { SignupHeader, SignupContent, ErrorText } from "../../styles";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircleNotch,
  faChevronLeft,
} from "@fortawesome/free-solid-svg-icons";

const Confirmation = ({
  sectionStatus,
  sectionClosed,
  errors,
  info,
  onChange,
  onBack,
  onSubmit,
  submissionPending,
}) => {
  return (
    <section>
      <SignupHeader>
        <h3>Confirmation</h3>
        <StatusSymbol state={sectionStatus} />
      </SignupHeader>
      <SignupContent closed={sectionClosed}>
        <button className="btn" onClick={onBack} data-test="basic-info-back">
          Back <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div>
          <ErrorText>{errors.agreement}</ErrorText>
          <div className="checkbox">
            <input
              type="checkbox"
              name="agreement"
              id="agreement"
              checked={info.agreement ?? false}
              onChange={onChange}
              noValidate
            />
            {/* <label htmlFor="agreement">
                I agree to the the Terms of Services and the{" "}
                <Link to="/privacy-policy" target="_BLANK">
                  Privacy Policy
                </Link>
              </label> */}
            <label htmlFor="agreement">
              I agree to use the Minerva platform in a fair and appropriate
              manner.
            </label>
          </div>
        </div>

        <button className="btn" onClick={onSubmit}>
          Submit{" "}
          {submissionPending && <FontAwesomeIcon icon={faCircleNotch} spin />}
        </button>
      </SignupContent>
    </section>
  );
};

export default Confirmation;
