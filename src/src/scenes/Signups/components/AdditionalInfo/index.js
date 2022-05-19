import Tags from "@yaireo/tagify/dist/react.tagify";
import FileManager from "components/FileManager";
import useFileManager from "hooks/useFileManager";

import StatusSymbol from "../StatusSymbol";
import selections from "config/whitelist.json";
import schools from "config/schools";
import set from "utilities/set";
import {
  faChevronLeft,
  faChevronRight,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

import { SignupHeader, SignupContent, ErrorText } from "scenes/Signups/styles";

const baseTagifySettings = {
  dropdown: {
    enabled: 0,
    classname: "tagifyDropdown",
    maxItems: 1000,
  },
};

const AdditionalInfo = ({
  sectionStatus,
  sectionClosed,
  errors,
  info,
  onTagsChange,
  onChange,
  setInfo,
  defaultApply,
  onBack,
  onNext,
}) => {
  const { processing, fileManagerProps } = useFileManager({
    edit: true,
    files: info.tutor?.academicRecords,
    setFiles(func) {
      setInfo((info) =>
        set(info, "tutor.academicRecords", func(info.academicRecords ?? []))
      );
    },
  });

  return (
    <section>
      <SignupHeader>
        <h3>Additional Info</h3>
        <StatusSymbol state={sectionStatus} />
      </SignupHeader>
      <SignupContent closed={sectionClosed}>
        <button className="btn" onClick={onBack} data-test="basic-info-back">
          Back <FontAwesomeIcon icon={faChevronLeft} />
        </button>

        <p>Don't worry, you can change all of this later.</p>
        <div>
          <label htmlFor="yearGroup">Select your year group:</label>
          <ErrorText>{errors.yearGroup}</ErrorText>
          <select
            name="yearGroup"
            id="yearGroup"
            value={info.yearGroup ?? ""}
            onChange={onChange}
            noValidate
          >
            <option value="">--SELECT--</option>
            {Object.entries(selections.year)
              .filter(
                ([year, isTertiary]) => defaultApply === "tutor" || !isTertiary
              )
              .map(([year]) => (
                <option value={year} key={year}>
                  {year}
                </option>
              ))}
          </select>
        </div>

        <div data-test="school">
          <label htmlFor="school">Select your school:</label>
          <ErrorText>{errors.school}</ErrorText>
          <Tags
            settings={{
              ...baseTagifySettings,
              enforceWhitelist: true,
              placeholder: "eg. Burnside High School",
              mode: "select",
            }}
            onChange={(e) => onTagsChange(e, "school", true)}
            defaultValue={info.school ?? ""}
            name="school"
            whitelist={schools
              .filter(
                (school) =>
                  defaultApply === "tutor" || school.type === "Secondary"
              )
              .map((school) => school.name)}
          />
        </div>

        {defaultApply === "tutor" && (
          <>
            <p>
              Note that your application to be a tutor will be reviewed by a
              human moderator.
            </p>
            <div>
              <div className="checkbox">
                <input
                  type="checkbox"
                  name="tutor.online"
                  id="online"
                  checked={info.tutor?.online ?? false}
                  onChange={onChange}
                  noValidate
                />
                <label htmlFor="online">
                  I am willing to tutor online (virtually)
                </label>
              </div>
            </div>

            <div data-test="location">
              <label htmlFor="location">
                If you are willing to tutor in person, select your location:
              </label>
              <Tags
                settings={{
                  ...baseTagifySettings,
                  enforceWhitelist: true,
                  placeholder: "eg. Wellington",
                  whitelist: selections.location,
                  mode: "select",
                }}
                onChange={(e) => onTagsChange(e, "tutor.location", true)}
                defaultValue={info.tutor?.location ?? ""}
                name="tutor.location"
              />
            </div>

            <div>
              <label htmlFor="name">Price per hour:</label>
              <input
                type="number"
                id="price"
                name="tutor.price"
                autoComplete="price"
                value={info.tutor?.price ?? ""}
                onChange={onChange}
                noValidate
              />
            </div>
            <div data-test="academicsTutoring">
              <label htmlFor="academicsTutoring">
                Add academic subjects that you want to{" "}
                <strong>tutor others in</strong>:
              </label>
              <Tags
                settings={{
                  ...baseTagifySettings,
                  enforceWhitelist: true,
                  placeholder: "eg. English",
                  whitelist: selections.academic,
                }}
                onChange={(e) => onTagsChange(e, "tutor.academicsTutoring")}
                defaultValue={info.tutor?.academicsTutoring}
                name="tutor.academicsTutoring"
              />
            </div>
            <div data-test="curricula">
              <label htmlFor="curricula">
                Add curricula that you want to <strong>tutor others in</strong>:
              </label>
              <Tags
                settings={{
                  ...baseTagifySettings,
                  enforceWhitelist: true,
                  placeholder: "eg. NCEA",
                  whitelist: selections.curricula,
                }}
                onChange={(e) => onTagsChange(e, "tutor.curricula")}
                defaultValue={info.tutor?.curricula}
                name="tutor.curricula"
              />
            </div>
            <div>
              <label>
                Please upload a copy of your latest school grades or other
                evidence of abilities relevant to the subjects you wish to tutor
              </label>
              <FileManager
                accept=".pdf, .doc, .docx"
                maxSize={10 * 1000 * 1024} // 10 MB
                maxFiles={5}
                {...fileManagerProps}
              />
            </div>
          </>
        )}

        <button
          className="btn"
          disabled={processing}
          onClick={onNext}
          data-test="additional-info-next"
        >
          Next <FontAwesomeIcon icon={faChevronRight} />
        </button>
      </SignupContent>
    </section>
  );
};

export default AdditionalInfo;
