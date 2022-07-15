import selections from "config/whitelist.json";

export default function TutorRequestForm({ info, onChange }) {
  return (
    <>
      <div>
        <label htmlFor="subject">
          Select the subject you want tutoring in:
        </label>
        <select
          name="subject"
          id="subject"
          value={info["subject"] ?? ""}
          onChange={onChange}
          noValidate
        >
          <option value="">--SELECT--</option>
          {selections.academic.map((academic) => (
            <option value={academic} key={academic}>
              {academic}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="curriculum">Select your curriculum:</label>
        <select
          name="curriculum"
          id="curriculum"
          value={info["curriculum"] ?? ""}
          onChange={onChange}
          noValidate
        >
          <option value="">--SELECT--</option>
          {selections.curricula.map((curriculum) => (
            <option value={curriculum} key={curriculum}>
              {curriculum}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label htmlFor="other">
          Do you have any other preferences? Eg. Specific expertise on a topic,
          a student in your house, or availability in / out of school.
        </label>
        <textarea
          name="other"
          id="other"
          value={info["other"] ?? ""}
          onChange={onChange}
          noValidate
        ></textarea>
      </div>
    </>
  );
}
