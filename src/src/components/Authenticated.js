import { Redirect } from "react-router-dom";
import { useLocation } from "react-router-dom";

export default function Authenticated({
  registrationStatus,
  current = [],
  children,
}) {
  const location = useLocation();

  switch (registrationStatus) {
    case "COMPLETE": {
      if (!current.includes("app")) {
        const redirect = new URLSearchParams(location.search).get("redirect");
        if (
          redirect &&
          new URL(document.baseURI).origin ===
            new URL(redirect, document.baseURI).origin
        )
          return <Redirect to={redirect} />;
        return <Redirect to="/dashboard" />;
      }
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
      if (!current.includes("login")) {
        const redirect = new URLSearchParams({
          redirect: location.pathname + location.search,
        });
        return <Redirect to={`/auth?${redirect.toString()}`} />;
      }
      break;
    }
  }
  return children;
}
