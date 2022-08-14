import { useEffect } from "react";
import { toast } from "react-toastify";

export default function useChatWS(ws, setMessages, channel) {
  useEffect(() => {
    if (!ws) return;
    const onMessage = (msg) => {
      if (msg.channel !== channel) return;
      setMessages((msgs) => [...msgs, msg]);
    };

    const onMessageResolve = ({ _id }) => {
      setMessages((st) => {
        const newState = [...st];
        const x = newState.find((m) => m._id === _id);
        if (x) x.loading = false;
        return newState;
      });
    };

    const onMessageReject = ({ _id }) => {
      setMessages((st) => {
        const newState = [...st];
        const msg = newState.find((m) => m._id === _id);
        if (msg) {
          msg.loading = false;
          msg.failed = true;
        }
        return newState;
      });
      toast.error("Message failed to send.");
    };

    ws.bind("MESSAGE", onMessage);
    ws.bind("MESSAGE_RESOLVE", onMessageResolve);
    ws.bind("MESSAGE_REJECT", onMessageReject);

    return () => {
      ws.unbind("MESSAGE", onMessage);
      ws.unbind("MESSAGE_RESOLVE", onMessageResolve);
      ws.unbind("MESSAGE_REJECT", onMessageReject);
    };
  }, [ws, setMessages, channel]);
}
