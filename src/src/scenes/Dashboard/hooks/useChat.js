import { useEffect } from "react";
import useWebSocket from "./useWebSocket";
import { useHistory, useRouteMatch } from "react-router-dom";
import { toast } from "react-toastify";

export default function useChat(currentUser) {
  const ws = useWebSocket(currentUser);

  const match = useRouteMatch("/dashboard/chats");
  const history = useHistory();

  useEffect(() => {
    function inboxHandler({ events }) {
      if (events.length > 3) {
        toast(`You have ${events.length} new messages.`, {
          onClick: () => history.push(`/dashboard/chats`),
        });
      } else {
        events.forEach((event) => {
          if (event.type === "MESSAGE") {
            toast(event.text, {
              onClick: () => history.push(`/dashboard/chats/${event.channel}`),
            });
          }
        });
      }
    }

    function messageHandler(msg) {
      if (match) return;
      toast(`${msg.authorName}: ${msg.text}`, {
        onClick: () => history.push(`/dashboard/chats/${msg.channel}`),
      });
    }
    ws.bind("INBOX", inboxHandler);
    ws.bind("MESSAGE", messageHandler);
    return () => {
      ws.unbind("INBOX", inboxHandler);
      ws.unbind("MESSAGE", messageHandler);
    };
  }, [match, ws, history]);

  return ws;
}
