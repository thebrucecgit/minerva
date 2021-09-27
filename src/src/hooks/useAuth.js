import { useHistory } from "react-router-dom";

const useAuth = (registrationStatus, exclude = []) => {
  const history = useHistory();

  switch (registrationStatus) {
    case "COMPLETE": {
      if (!exclude.includes("app")) {
        history.replace("/dashboard");
        return false;
      }
      break;
    }
    case "EMAIL_NOT_CONFIRMED": {
      if (!exclude.includes("confirm")) {
        history.replace("/signup/confirm");
        return false;
      }
      break;
    }
    case "GOOGLE_SIGNED_IN": {
      if (!exclude.includes("signup")) {
        history.replace("/signup");
        return false;
      }
      break;
    }
    default: {
      if (!exclude.includes("login")) {
        history.replace("/auth");
        return false;
      }
      break;
    }
  }
  return true;
};

export default useAuth;
