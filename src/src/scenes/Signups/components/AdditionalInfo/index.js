import Tags from "@yaireo/tagify/dist/react.tagify";
import classNames from "classnames";
import FileManager from "components/FileManager";
import useFileManager from "hooks/useFileManager";

import StatusSymbol from "../StatusSymbol";
import selections from "config/whitelist.json";
import set from "utilities/set";

import styles from "../../styles.module.scss";

const baseTagifySettings = {
  dropdown: {
    enabled: 0,
    classname: "tagifyDropdown",
    maxItems: 100,
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
              {Object.keys(selections.year).map((year) => (
                <option value={year} key={year}>
                  {year}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.field} data-test="school">
            <label htmlFor="school">Select your school:</label>
            {errors.yearGroup && (
              <p className={styles.invalid}>{errors.school}</p>
            )}
            <Tags
              settings={{
                ...baseTagifySettings,
                enforceWhitelist: true,
                placeholder: "eg. Burnside High School",
                whitelist: Object.keys(selections.school),
                mode: "select",
              }}
              onChange={(e) => onTagsChange(e, "school", true)}
              defaultValue={info.school ?? ""}
              name="school"
            />
          </div>

          {defaultApply === "tutor" && (
            <>
              <p>
                Note that your application to be a tutor will be reviewed by a
                human moderator.
              </p>
              <div className={styles.field}>
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

              <div className={styles.field} data-test="location">
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

              <div className={styles.field}>
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
                  onChange={(e) => onTagsChange(e, "tutor.academicsTutoring")}
                  defaultValue={info.tutor?.academicsTutoring}
                  name="tutor.academicsTutoring"
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
                  onChange={(e) => onTagsChange(e, "tutor.curricula")}
                  defaultValue={info.tutor?.curricula}
                  name="tutor.curricula"
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
