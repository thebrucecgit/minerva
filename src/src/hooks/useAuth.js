import { useEffect } from "react";
import { useHistory } from "react-router-dom";

const useAuth = (registrationStatus, exclude = []) => {
  const history = useHistory();

  useEffect(() => {
    switch (registrationStatus) {
      case "COMPLETE": {
        if (!exclude.includes("app")) history.replace("/dashboard");
        break;
      }
      case "EMAIL_NOT_CONFIRMED": {
        if (!exclude.includes("confirm")) history.replace("/confirm");
        break;
      }
      case "GOOGLE_SIGNED_IN": {
        if (!exclude.includes("signup")) history.replace("/signup");
        break;
      }
      default: {
        if (!exclude.includes("login")) history.replace("/auth");
        break;
      }
    }
  }, [exclude, registrationStatus, history]);
};

export default useAuth;
