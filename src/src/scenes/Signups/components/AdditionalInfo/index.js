import Tags from "@yaireo/tagify/dist/react.tagify";
import classNames from "classnames";
import FileManager from "components/FileManager";
import useFileManager from "hooks/useFileManager";

import StatusSymbol from "../StatusSymbol";
import selections from "config/whitelist.json";

import styles from "../../styles.module.scss";

const baseTagifySettings = {
  dropdown: {
    enabled: 0,
    classname: "tagifyDropdown",
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
  onNext,
}) => {
  const setFiles = (func) => {
    setInfo((info) => ({
      ...info,
      academicRecords: func(info.academicRecords ?? []),
    }));
  };
  const { processing, fileManagerProps } = useFileManager({
    edit: true,
    setFiles,
    files: info.academicRecords,
  });

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
                  {year}
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

          {defaultApply === "tutee" && (
            <div className={styles.field}>
              <div className="checkbox">
                <input
                  type="checkbox"
                  name="applyTutor"
                  id="applyTutor"
                  checked={info.applyTutor ?? false}
                  onChange={onChange}
                  noValidate
                />
                <label htmlFor="applyTutor">
                  I would also like to tutor others
                </label>
              </div>
            </div>
          )}
          {info.applyTutor && (
            <>
              <p>
                Note that your application to be a tutor will be reviewed by a
                human moderator.
              </p>
              <div className={styles.field}>
                <div className="checkbox">
                  <input
                    type="checkbox"
                    name="tertiary"
                    id="tertiary"
                    checked={info.tertiary ?? false}
                    onChange={onChange}
                    noValidate
                  />
                  <label htmlFor="tertiary">
                    Check if you're studying at a tertiary level
                  </label>
                </div>
              </div>
              <div className={styles.field} data-test="academicsTutoring">
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
                  onChange={(e) => onTagsChange(e, "academicsTutoring")}
                  defaultValue={info.academicsTutoring}
                  name="academicsTutoring"
                />
              </div>
              <div className={styles.field} data-test="curricula">
                <label htmlFor="curricula">
                  Add curricula that you want to{" "}
                  <strong>tutor others in</strong>:
                </label>
                <Tags
                  settings={{
                    ...baseTagifySettings,
                    enforceWhitelist: true,
                    placeholder: "eg. NCEA",
                    whitelist: selections.curricula,
                  }}
                  onChange={(e) => onTagsChange(e, "curricula")}
                  defaultValue={info.curricula}
                  name="curricula"
                />
              </div>
              <div className={styles.fields}>
                <label>
                  Please upload a copy of your latest school grades or other
                  evidence of abilities relevant to the subjects you wish to
                  tutor
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
            Next
          </button>
        </div>
      </div>
    </section>
  );
};

export default AdditionalInfo;
