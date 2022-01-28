import { useApolloClient } from "@apollo/client";
import { useEffect } from "react";

export default function Logout({ logout }) {
  const client = useApolloClient();

  useEffect(() => {
    client.resetStore();
    logout();
  }, [client, logout]);

  return <p>Logging out...</p>;
}
