import { Redirect } from "react-router-dom";

export default function Authenticated({
  registrationStatus,
  current = [],
  children,
}) {
  switch (registrationStatus) {
    case "COMPLETE": {
      if (!current.includes("app")) return <Redirect to="/dashboard" />;
      break;
    }
    case "EMAIL_NOT_CONFIRMED": {
      if (!current.includes("confirm"))
        return <Redirect to="/signup/confirm" />;
      break;
    }
    case "GOOGLE_SIGNED_IN": {
      if (!current.includes("signup")) return <Redirect to="/signup" />;
      break;
    }
    default: {
      if (!current.includes("login")) return <Redirect to="/auth" />;
      break;
    }
  }
  return children;
}
