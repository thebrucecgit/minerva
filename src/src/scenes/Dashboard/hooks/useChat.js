import { useEffect } from "react";
import useWebSocket from "./useWebSocket";
import { useRouteMatch } from "react-router-dom";
import { toast } from "react-toastify";

export default function useChat(currentUser) {
  const ws = useWebSocket(currentUser);

  const match = useRouteMatch("/dashboard/chats");

  useEffect(() => {
    function inboxHandler({ events }) {
      if (events.length > 3) {
        toast(`You have ${events.length} new messages.`);
      } else {
        events.forEach((event) => {
          if (event.type === "MESSAGE") {
            toast(event.text);
          }
        });
      }
    }
    function messageHandler(msg) {
      if (!match) toast(`${msg.authorName}: ${msg.text}`);
    }
    ws.bind("INBOX", inboxHandler);
    ws.bind("MESSAGE", messageHandler);
    return () => {
      ws.unbind("INBOX", inboxHandler);
      ws.unbind("MESSAGE", messageHandler);
    };
  }, [match, ws]);

  return ws;
}
