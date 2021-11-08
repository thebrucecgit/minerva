import { useEffect } from "react";
import { toast } from "react-toastify";

export default function useChatWS(ws, setMessages) {
  useEffect(() => {
    if (!ws) return;
    const onMessage = (msg) => {
      setMessages((msgs) => [...msgs, msg]);
    };

    const onMessageResolve = ({ _id }) => {
      setMessages((st) => {
        const newState = [...st];
        newState.find((m) => m._id === _id).loading = false;
        return newState;
      });
    };

    const onMessageReject = ({ _id }) => {
      setMessages((st) => {
        const newState = [...st];
        const msg = newState.find((m) => m._id === _id);
        msg.loading = false;
        msg.failed = true;
        return newState;
      });
      toast.error("Message failed to send.");
    };

    ws.bind("MESSAGE", onMessage);
    ws.bind("MESSAGE_RESOLVE", onMessageResolve);
    ws.bind("MESSAGE_REJECT", onMessageReject);

    return () => {
      ws.unbind("MESSAGE", onMessage);
    };
  }, [ws, setMessages]);
}
