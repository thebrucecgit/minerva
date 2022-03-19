import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { loader } from "graphql.macro";
import { useApolloClient } from "@apollo/client";
import { format, parseISO } from "date-fns";
import Error from "components/Error";
import Message from "../Message";
import {
  faChevronLeft,
  faCircleNotch,
} from "@fortawesome/free-solid-svg-icons";
import { useInView } from "react-intersection-observer";
import useChatWS from "./hooks/useChatWS";
import useGroupMessages from "./hooks/useGroupMessages";
import useHandlers from "./hooks/useHandlers";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  StyledChat,
  ChatHeader,
  BackButton,
  ChatHeaderRight,
  MessageContent,
  MessageGroup,
  DateBreaker,
  NoMessages,
  ChatMessageInput,
  FetchLoad,
  FetchMore,
} from "./styles";
import { toast } from "react-toastify";

const GET_CHAT = loader("./graphql/GetChat.gql");
const MESSAGES_GROUP = 20;

const Chat = ({ sendMessage, ws, currentUser, createSession }) => {
  const { channel } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messageElem = useRef(null);

  useChatWS(ws, setMessages);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState();
  const [chatInfo, setChatInfo] = useState({});
  const [skip, setSkip] = useState(0);

  const client = useApolloClient();

  useEffect(() => {
    (async () => {
      try {
        const { data } = await client.query({
          query: GET_CHAT,
          variables: { channel, skip: 0, limit: MESSAGES_GROUP },
        });
        setSkip((st) => st + MESSAGES_GROUP);
        setChatInfo(data.getChat);
        setMessages(data.getChat.messages);
      } catch (e) {
        setError(e);
      } finally {
        setLoading(false);
      }
    })();
  }, [channel, client]);

  const editMessage = (e) => {
    e.persist();
    setMessage(e.target.value);
  };

  const [handleSubmit, handleRetry] = useHandlers({
    message,
    channel,
    sendMessage,
    setMessage,
    setMessages,
    messageElem,
  });

  const dayMessages = useGroupMessages(messages, currentUser);
  const [fullyLoaded, setFullyLoaded] = useState(false);
  const [intersectRef, inView] = useInView({ threshold: 0.5 });
  useEffect(() => {
    setFullyLoaded(messages[0]?.type === "CREATION");
  }, [messages]);

  const [scrollLoading, setScrollLoading] = useState(false);

  useEffect(() => {
    if (loading || fullyLoaded || !inView) return;
    (async () => {
      setScrollLoading(true);
      try {
        const { data } = await client.query({
          query: GET_CHAT,
          variables: { channel, skip, limit: MESSAGES_GROUP },
        });
        setSkip((st) => st + MESSAGES_GROUP);
        setMessages((st) => [...data.getChat.messages, ...st]);
      } catch (e) {
        toast.error(e.message);
      } finally {
        setScrollLoading(false);
      }
    })();
  }, [loading, fullyLoaded, inView, channel, client, skip]);

  const createSessionFromChat = () => {
    createSession(chatInfo.users);
  };

  if (error) return <Error error={error} />;
  if (loading) return <p>Loading</p>;

  const getNameById = (id) => chatInfo.users.find((u) => u._id === id)?.name;

  return (
    <StyledChat>
      <ChatHeader>
        <h2>
          <BackButton to="/dashboard/chats">
            <FontAwesomeIcon icon={faChevronLeft} />
          </BackButton>
          {chatInfo.bindToClass
            ? chatInfo.class.name
            : chatInfo.users.map((u) => u.name).join(", ")}
        </h2>

        <ChatHeaderRight>
          <button className="btn" onClick={createSessionFromChat}>
            New Session
          </button>
        </ChatHeaderRight>
      </ChatHeader>
      <MessageContent ref={messageElem}>
        {/* empty div needed for default scroll to bottom */}
        <div>
          {!fullyLoaded &&
            (scrollLoading ? (
              <FetchLoad>
                <FontAwesomeIcon icon={faCircleNotch} pulse size="2x" />
              </FetchLoad>
            ) : (
              <FetchMore ref={intersectRef}></FetchMore>
            ))}
          {dayMessages.length ? (
            dayMessages.map((day) => (
              <MessageGroup key={day[0]}>
                <DateBreaker>
                  {format(parseISO(day[0]), "d MMMM yyyy")}
                </DateBreaker>
                {day[1].map((message) => (
                  <Message
                    key={message._id}
                    message={message}
                    getNameById={getNameById}
                    handleRetry={handleRetry}
                  />
                ))}
              </MessageGroup>
            ))
          ) : (
            <NoMessages>There are no messages in this chat yet.</NoMessages>
          )}
        </div>
      </MessageContent>
      <ChatMessageInput onSubmit={handleSubmit}>
        <input type="text" onChange={editMessage} value={message} />
        <button className="btn">Send</button>
      </ChatMessageInput>
    </StyledChat>
  );
};

export default Chat;
