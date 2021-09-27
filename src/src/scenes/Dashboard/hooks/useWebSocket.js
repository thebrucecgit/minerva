import { useEffect, useCallback } from "react";
import { toast } from "react-toastify";
import { parseJSON } from "date-fns";

const { REACT_APP_WEBSOCKET_URI } = process.env;

let ws;
let timeoutInterval = 500;
const eventListeners = {};
let errorToast = null;

const bind = (eventType, handler) => {
  if (typeof handler !== "function")
    throw new Error("Missing handler function");
  if (Array.isArray(eventListeners[eventType]))
    eventListeners[eventType].push(handler);
  else eventListeners[eventType] = [handler];
};

const unbind = (eventType, handler) => {
  if (typeof handler !== "function")
    throw new Error("Missing handler function");
  if (!Array.isArray(eventListeners[eventType])) return;
  const ind = eventListeners[eventType].indexOf(handler);
  if (ind !== -1) eventListeners[eventType].splice(ind, 1);
};

const useWebSocket = ({ jwt }) => {
  const connect = useCallback(() => {
    let connectTimer;

    if (!jwt) throw new Error("Not logged in.");

    const auth = new URLSearchParams({ token: jwt });
    ws = new WebSocket(`${REACT_APP_WEBSOCKET_URI}?${auth.toString()}`);

    ws.onopen = () => {
      console.log("WebSocket connected");
      if (errorToast) {
        toast.dismiss(errorToast);
        errorToast = null;
      }
      timeoutInterval = 500; // reset
    };

    ws.onmessage = ({ data }) => {
      const event = JSON.parse(data);
      if (event.time) event.time = parseJSON(event.time);
      if (Array.isArray(eventListeners[event.type])) {
        eventListeners[event.type].forEach((bind) => bind(event));
      }
    };

    ws.onclose = (e) => {
      if (e.code === 1000) {
        // Component unload close
        console.log("WebSocket disconnected on component unload.");
        return;
      }
      if (!errorToast)
        errorToast = toast.error("Disconnected from server. Reconnecting...", {
          autoClose: false,
        });

      // Load distribution to ensure that not all clients retry at the same time
      const randomness = Math.floor(Math.random() * timeoutInterval);
      const modifiedTimeoutInterval = timeoutInterval / 2 + randomness;

      console.log(
        `WebSocket disconnected because of ${e.reason} with code ${
          e.code
        }. Reconnect will be attempted in ${Math.round(
          modifiedTimeoutInterval / 1000
        )} second(s).`
      );

      connectTimer = setTimeout(() => {
        if (!ws || ws.readyState === WebSocket.CLOSED) connect();
      }, modifiedTimeoutInterval);

      timeoutInterval = Math.min(5 * 60 * 1000, timeoutInterval * 2);
    };

    ws.onerror = (e) => {
      console.error("Socket encountered an error");
      ws.close(4000, "Closing because of error");
    };

    return () => {
      ws.close(1000, "Component unload");
      clearTimeout(connectTimer);
      if (errorToast) toast.dismiss(errorToast);
    };
  }, [jwt]);

  useEffect(() => {
    try {
      return connect();
    } catch (e) {
      console.error(e);
      toast.error(e.message);
    }
  }, [connect]);

  const trigger = (event) => {
    if (ws.readyState === ws.OPEN) ws.send(JSON.stringify(event));
    else throw new Error("Connection unavailable");
  };

  return { bind, unbind, trigger };
};

export default useWebSocket;
