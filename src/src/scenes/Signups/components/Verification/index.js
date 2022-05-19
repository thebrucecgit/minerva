import StatusSymbol from "../StatusSymbol";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { SignupHeader, SignupContent, ErrorText } from "scenes/Signups/styles";

const Verification = ({
  sectionStatus,
  sectionClosed,
  errors,
  info,
  onChange,
  onBack,
  onNext,
  defaultApply,
}) => {
  const placeholderBio =
    defaultApply === "tutor"
      ? `eg. I'm a third-year Economics student at the University of Auckland with 2 years of tutoring experience from high school. 
        I achieved outstanding scholarships in physics, chemistry, and English, and would like to help you do the same! 
        Both online and in-person options work for me. I look forward to meeting you.`
      : "";

  return (
    <section>
      <SignupHeader>
        <h3>Biography</h3>
        <StatusSymbol state={sectionStatus} />
      </SignupHeader>
      <SignupContent closed={sectionClosed}>
        <button className="btn" onClick={onBack} data-test="basic-info-back">
          Back <FontAwesomeIcon icon={faChevronLeft} />
        </button>
        <div>
          <label htmlFor="biography">
            {defaultApply === "tutor" ? (
              <>
                <p>Feel free to be creative, but we recommend the following:</p>
                <ul>
                  <li>Your qualifications</li>
                  <li>What you're currently studying (if you're in Uni)</li>
                  <li>
                    Clear up any ambiguity in the curricula or subjects you
                    tutor
                  </li>
                </ul>
              </>
            ) : (
              <p>Optional, but feel free to be creative! </p>
            )}
          </label>

          <ErrorText>{errors.biography}</ErrorText>
          <textarea
            name="biography"
            id="biography"
            rows="5"
            placeholder={placeholderBio}
            value={info.biography ?? ""}
            onChange={onChange}
            noValidate
          ></textarea>
        </div>

        <button className="btn" onClick={onNext} data-test="verification-next">
          Next <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </SignupContent>
    </section>
  );
};

export default Verification;
