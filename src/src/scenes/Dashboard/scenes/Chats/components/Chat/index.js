import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, NavLink } from "react-router-dom";
import { loader } from "graphql.macro";
import { useQuery } from "@apollo/client";
import { format, startOfDay, parseISO, differenceInMinutes } from "date-fns";
import { toast } from "react-toastify";
import Error from "../../../../../../components/Error";
import Menu from "../../../../components/Menu";
import useMenu from "../../../../hooks/useMenu";
import Message from "../Message";
import { faChevronLeft, faUsers } from "@fortawesome/free-solid-svg-icons";
import scrollbar from "styles/scrollbar";

import styled from "styled-components";
import mediaQuery from "styles/sizes";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

const GET_CHAT = loader("./graphql/GetChat.gql");

const StyledChat = styled.div`
  height: 100vh;
  width: 100vw;
  position: fixed;
  z-index: 6;
  display: flex;
  flex-direction: column;

  ${mediaQuery("lg")`
    position: relative;
    width: auto;
  `}

  .scrollDown {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index: 1;
    display: none;
    &.showDown {
      display: block;
    }
  }
`;

const ChatHeader = styled.div`
  display: flex;
  padding: 0 1rem;
  color: #fff;
  background-color: #000;

  h2 {
    margin: 1rem 0;
  }
`;

const ChatHeaderUsers = styled.div`
  margin-left: auto;
`;

const ChatMessageInput = styled.form`
  display: flex;
  input {
    margin: 10px 0;
    max-width: 100%;
    margin-right: 10px;
  }
`;

const MessageContent = styled.div`
  overflow-y: scroll;
  height: 100%;
  display: flex;
  flex-direction: column-reverse;
  background: linear-gradient(
    to right,
    rgb(240, 240, 240) 0%,
    rgb(247, 247, 247) 100%
  );

  ${scrollbar}
`;

const MessageGroup = styled.div`
  padding: 1rem 2rem;
`;

const NoMessages = styled(MessageGroup)`
  text-align: center;
`;

const DateBreaker = styled.h4`
  font-weight: normal;
  width: 100%;
  text-align: center;
`;

const BackButton = styled(NavLink)`
  margin-right: 1rem;
  ${mediaQuery("lg")`
    display: none;
  `}
`;

const Chat = ({ sendMessage, ws, currentUser }) => {
  const { channel } = useParams();
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const messageElem = useRef(null);

  const [rootClick, menuBinds] = useMenu(false);

  const { data, loading, error } = useQuery(GET_CHAT, {
    variables: { channel },
  });

  useEffect(() => {
    if (ws) {
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
    }
  }, [ws]);

  useEffect(() => {
    if (data) {
      const { messages } = data.getChat;
      setMessages(messages);
    }
  }, [data]);

  const editMessage = (e) => {
    e.persist();
    setMessage(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.length === 0) return;
    const evt = sendMessage(channel, message);
    evt.loading = true;
    setMessage("");
    setMessages((st) => [...st, evt]);
    messageElem.current.scrollTop = messageElem.current.scrollHeight;
  };

  const handleRetryMessage = (id) => {
    const { failed, time } = sendMessage(
      channel,
      messages.find((msg) => msg._id === id).text,
      id
    );
    setMessages((st) => {
      const state = [...st];
      const msg = state.find((msg) => msg._id === id);
      msg.failed = failed;
      msg.time = time;
      return state;
    });
  };

  const dayMessages = useMemo(() => {
    if (!messages.length) return [];
    const msgGroup = new Map();
    for (const message of messages) {
      const day = startOfDay(message.time).toISOString();
      if (msgGroup.has(day)) msgGroup.get(day).push(message);
      else msgGroup.set(day, [message]);
    }
    const result = [];
    for (const m of msgGroup) {
      const group = m[1].map((g, i) => ({
        ...g,
        header: !(
          m[1][i - 1]?.author === m[1][i].author &&
          (!m[1][i - 1] ||
            differenceInMinutes(m[1][i].time, m[1][i - 1].time) < 10)
        ),
        me: m[1][i].author === currentUser.user._id,
      }));
      result.push([m[0], group]);
    }
    return result;
  }, [messages, currentUser]);

  if (error) return <Error error={error} />;
  if (loading) return <p>Loading</p>;

  const chatInfo = data.getChat;

  const getNameById = (id) => chatInfo.users.find((u) => u._id === id)?.name;

  return (
    <StyledChat onClick={rootClick}>
      <ChatHeader>
        <h2>
          <BackButton to="/dashboard/chats">
            <FontAwesomeIcon icon={faChevronLeft} />
          </BackButton>
          {chatInfo.bindToClass
            ? chatInfo.class.name
            : chatInfo.users.map((u) => u.name).join(", ")}
        </h2>
        <ChatHeaderUsers>
          <Menu {...menuBinds} icon={faUsers}>
            {chatInfo.users.map((u) => (
              <div key={u._id}>{u.name}</div>
            ))}
          </Menu>
        </ChatHeaderUsers>
      </ChatHeader>
      <MessageContent ref={messageElem}>
        {/* empty div needed for default scroll to bottom */}
        <div>
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
                    handleRetryMessage={handleRetryMessage}
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
