import React, { useState, useEffect } from "react";
import { loader } from "graphql.macro";
import { useMutation, useQuery } from "@apollo/react-hooks";
import { toast } from "react-toastify";

const SEND_EVENT = loader("./graphql/SendEvent.gql");
const GET_CHAT = loader("./graphql/GetChat.gql");

const Chat = ({ pusher }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");

  const [sendEvent] = useMutation(SEND_EVENT);
  const { refetch: getChat } = useQuery(GET_CHAT, { skip: true });

  useEffect(() => {
    if (pusher) {
      const channels = [
        "private-example",
        "private-testing",
      ].map((channelName) => pusher.subscribe(channelName));

      const onEvent = (event) => {
        console.log(event);
      };

      channels.forEach((channel) => {
        channel.bind("MESSAGE", onEvent);
        channel.bind("pusher:subscription_succeeded", async () => {
          console.log("successfully subscribed");
          // try {
          //   const {
          //     data: { getChat: chatInfo },
          //   } = await getChat({
          //     channel: "private-example",
          //   });
          //   setMessages(chatInfo.events);
          //   console.log(chatInfo);
          // } catch (e) {
          //   console.error(e);
          // }
        });
      });

      console.log(channels);

      // channel.bind("MESSAGE", (event) => {
      //   setMessages((events) => [...events, event]);
      // });

      return () => {
        pusher.disconnect();
      };
    }
  }, [pusher]);

  const sendMessage = async () => {
    try {
      await sendEvent({
        variables: {
          channel: "private-example",
          event: {
            type: "MESSAGE",
            time: new Date(),
            text: message,
          },
        },
      });
      setMessage("");
    } catch (e) {
      toast.error(e.message);
    }
  };

  const editMessage = (e) => {
    e.persist();
    setMessage(e.target.value);
  };

  return (
    <div>
      <div>
        {messages.map((event, ind) => (
          <p key={ind}>
            {event.author}: {event.text} @ {event.time}
          </p>
        ))}
      </div>
      <input type="text" onChange={editMessage} value={message} />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
