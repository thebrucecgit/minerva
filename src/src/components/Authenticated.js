import { Redirect } from "react-router-dom";

export default function Authenticated({
  registrationStatus,
  exclude = [],
  onLoad = () => {},
}) {
  switch (registrationStatus) {
    case "COMPLETE": {
      if (!exclude.includes("app")) return <Redirect to="/dashboard" />;
      break;
    }
    case "EMAIL_NOT_CONFIRMED": {
      if (!exclude.includes("confirm"))
        return <Redirect to="/signup/confirm" />;
      break;
    }
    case "GOOGLE_SIGNED_IN": {
      if (!exclude.includes("signup")) return <Redirect to="/signup" />;
      break;
    }
    default: {
      if (!exclude.includes("login")) return <Redirect to="/auth" />;
      break;
    }
  }
  onLoad();
  return null;
}
