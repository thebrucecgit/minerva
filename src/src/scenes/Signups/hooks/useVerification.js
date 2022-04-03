import regex from "../regex";
import selections from "config/whitelist.json";

export default function useVerification(
  info,
  strategy,
  setErrors,
  defaultApply
) {
  const validate = (section) => {
    const newErrors = {};

    switch (section) {
      case "Basic Info": {
        if (!info.name || info.name.length <= 2)
          newErrors.name = "Name is too short";
        if (!info.email || !regex.email.test(info.email))
          newErrors.email = "Email is invalid";
        if (
          strategy === "local" &&
          (!info.password || info.password.length < 8)
        )
          newErrors.password =
            "Password needs to have a minimum of eight characters";
        break;
      }
      case "Additional Info": {
        if (!info.yearGroup)
          newErrors.yearGroup = "Please select your year group";
        if (!info.school) newErrors.school = "Please select your school";

        if (
          info.yearGroup &&
          info.school &&
          selections.year[info.yearGroup] !== selections.school[info.school]
        )
          newErrors.yearGroup = "Year group and school appear mismatched.";
        break;
      }
      case "Verification": {
        if (!info.biography && defaultApply)
          newErrors.biography = "Please write about yourself";
        break;
      }
      case "Confirmation": {
        if (!info.agreement)
          newErrors.agreement = "You must agree to the terms";
        break;
      }
      default:
        break;
    }

    setErrors(newErrors);
    return Object.values(newErrors).length === 0;
  };
  return validate;
}
