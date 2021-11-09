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
          <p>Don't worry, you can change all of this later.</p>
          <div className={styles.field}>
            <label htmlFor="yearGroup">Select your year group:</label>
            {errors.yearGroup && (
              <p className={styles.invalid}>{errors.yearGroup}</p>
            )}
            <select
              name="yearGroup"
              id="yearGroup"
              value={info.yearGroup ?? ""}
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
            <label htmlFor="school">Select your school:</label>
            {errors.school && <p className={styles.invalid}>{errors.school}</p>}
            <select
              name="school"
              id="school"
              value={info.school ?? ""}
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
          </div>
          <p>
            Feel free to leave the following two <strong>blank</strong> if you
            only want to be a tutor.
          </p>
          <div className={styles.field} data-test="academicsLearning">
            <label>
              Add academic subjects <strong>you want support in</strong>:
            </label>
            {/* {errors.academicsLearning && (
              <p className={styles.invalid}>{errors.academics}</p>
            )} */}
            <Tags
              settings={{
                ...baseTagifySettings,
                enforceWhitelist: true,
                placeholder: "eg. English",
                whitelist: selections.academic,
              }}
              onChange={(e) => onTagsChange(e, "academicsLearning")}
              defaultValue={info.academicsLearning}
              name="academic"
            />
          </div>
          <div className={styles.field} data-test="extrasLearning">
            <label>
              Add extra-curricular activities{" "}
              <strong>you want support in</strong>:
            </label>
            {/* {errors.extrasLearning && <p className={styles.invalid}>{errors.extra}</p>} */}
            <Tags
              settings={{
                ...baseTagifySettings,
                placeholder: "eg. Programming",
                whitelist: selections.extra,
              }}
              onChange={(e) => onTagsChange(e, "extrasLearning")}
              defaultValue={info.extrasLearning}
              name="extrasLearning"
            />
          </div>
          <div className={styles.field}>
            {/* {errors.agreement && (
              <p className={styles.invalid}>{errors.agreement}</p>
            )} */}
            <div className="checkbox">
              <input
                type="checkbox"
                name="applyTutor"
                id="applyTutor"
                checked={info.applyTutor ?? false}
                onChange={onChange}
                noValidate
              />
              <label htmlFor="applyTutor">I would like to tutor others</label>
            </div>
          </div>
          {info.applyTutor && (
            <>
              <p>
                Note that your application to be a tutor will be reviewed by an
                Academe moderator.
              </p>
              <div className={styles.field} data-test="academicsTutoring">
                <label>
                  Add academic subjects that you want to{" "}
                  <strong>tutor others in</strong>:
                </label>
                {/* {errors.academicsTutoring && (
              <p className={styles.invalid}>{errors.academics}</p>
            )} */}
                <Tags
                  settings={{
                    ...baseTagifySettings,
                    enforceWhitelist: true,
                    placeholder: "eg. English",
                    whitelist: selections.academic,
                  }}
                  onChange={(e) => onTagsChange(e, "academicsTutoring")}
                  defaultValue={info.academicsTutoring}
                  name="academic"
                />
              </div>
              <div className={styles.field} data-test="extrasTutoring">
                <label>
                  Add extra-curricular activities that you want to{" "}
                  <strong>tutor others in</strong>:
                </label>
                {/* {errors.extrasTutoring && <p className={styles.invalid}>{errors.extra}</p>} */}
                <Tags
                  settings={{
                    ...baseTagifySettings,
                    placeholder: "eg. Programming",
                    whitelist: selections.extra,
                  }}
                  onChange={(e) => onTagsChange(e, "extrasTutoring")}
                  defaultValue={info.extrasTutoring}
                  name="extrasTutoring"
                />
              </div>

              <div className={styles.field}>
                <label htmlFor="grades">
                  Please link to a copy of your latest school grades or other
                  evidence of abilities relevant to the subjects you wish to
                  tutor
                </label>
                {errors.grades && (
                  <p className={styles.invalid}>{errors.grades}</p>
                )}
                <input
                  type="text"
                  name="grades"
                  id="grades"
                  value={info.grades ?? ""}
                  onChange={onChange}
                  noValidate
                />
              </div>
            </>
          )}

          <button
            className="btn"
            onClick={onNext}
            data-test="additional-info-next"
          >
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdditionalInfo;
