import React from "react";
import Tags from "@yaireo/tagify/dist/react.tagify";
import classNames from "classnames";

import StatusSymbol from "../StatusSymbol";
import selections from "../../../../config/whitelist.json";

import styles from "../../styles.module.scss";

const AdditionalInfo = ({
  sectionStatus,
  sectionClosed,
  errors,
  info,
  userType,
  onTagsChange,
  onChange,
  onNext,
}) => {
  const baseTagifySettings = {
    dropdown: {
      enabled: 0,
      classname: "tagifyDropdown",
    },
  };

  return (
    <section>
      <div className={styles.header}>
        <h3>Additional Info</h3>
        <StatusSymbol state={sectionStatus} />
      </div>
      <div
        className={classNames(styles.body, {
          [styles.closed]: sectionClosed,
        })}
      >
        <div className={styles.content}>
          <div className={styles.field}>
            <label htmlFor="yearGroup">Select your year group: </label>
            {errors.yearGroup && (
              <p className={styles.invalid}>{errors.yearGroup}</p>
            )}
            <select
              name="yearGroup"
              id="yearGroup"
              value={info.yearGroup}
              onChange={onChange}
              noValidate
            >
              <option value="">--SELECT--</option>
              {selections.year.map((year) => (
                <option value={year} key={year}>
                  Year {year}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field}>
            <label htmlFor="school">Enter your school school's name: </label>
            {errors.school && <p className={styles.invalid}>{errors.school}</p>}
            <select
              name="school"
              id="school"
              value={info.school}
              onChange={onChange}
              noValidate
            >
              <option value="">--SELECT--</option>
              {selections.school.map((school, ind) => (
                <option value={school} key={ind}>
                  {school}
                </option>
              ))}
            </select>
            {/* There needs to be someway to enforce whitelist with what's below */}
            {/* <Tags
                    settings={{
                      ...baseTagifySettings,
                      mode: "select",
                      enforceWhitelist: true,
                      keepInvalidTags: false,
                      placeholder: "eg. Christ's College",
                      whitelist: selections.school,
                      callbacks: {
                        input: (e) => onDatalistChange(e, "school"),
                        blur: (e) => onDatalistBlur(e, "school"),
                      },
                    }}
                    value={[info.school]}
                    name="school"
                    
                    noValidate
                  /> */}
          </div>

          <div className={styles.field}>
            <label>
              Add academic subjects you want{" "}
              {userType === "TUTOR" ? "to tutor" : "tutoring"} in (you can
              change this later):{" "}
            </label>
            {errors.academics && (
              <p className={styles.invalid}>{errors.academics}</p>
            )}
            <Tags
              settings={{
                ...baseTagifySettings,
                enforceWhitelist: true,
                placeholder: "eg. English",
                whitelist: selections.academic,
                callbacks: {
                  add: (e) => onTagsChange(e, "academics"),
                  remove: (e) => onTagsChange(e, "academics"),
                },
              }}
              value={info.academics}
              name="academic"
            />
          </div>

          <div className={styles.field}>
            <label>
              Add any extra-curriculars activities you want{" "}
              {userType === "TUTOR" ? "to tutor" : "tutoring"} in (you can
              change this later):{" "}
            </label>
            {errors.extras && <p className={styles.invalid}>{errors.extra}</p>}
            <Tags
              settings={{
                ...baseTagifySettings,
                placeholder: "eg. Programming",
                whitelist: selections.extra,
                callbacks: {
                  add: (e) => onTagsChange(e, "extras"),
                  remove: (e) => onTagsChange(e, "extras"),
                },
              }}
              value={info.extras}
              name="extras"
            />
          </div>
          <button className="btn" onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdditionalInfo;
