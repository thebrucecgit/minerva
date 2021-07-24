import React, { useState, useEffect, useRef, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { loader } from "graphql.macro";
import { useQuery } from "@apollo/client";
import { format, startOfDay, parseISO, differenceInMinutes } from "date-fns";
import { toast } from "react-toastify";
import classNames from "classnames";
import Error from "../../../../../../components/Error";
import Menu from "../../../../components/Menu";
import useMenu from "../../../../hooks/useMenu";

import messageStyles from "./message.module.scss";
import styles from "../../styles.module.scss";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faUsers, faRedo } from "@fortawesome/free-solid-svg-icons";

const GET_CHAT = loader("./graphql/GetChat.gql");

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

  const getNameById = (id) => chatInfo.users.find((u) => u._id === id).name;

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

  return (
    <div className={styles.Chat} onClick={rootClick}>
      <div className={styles.header}>
        <h2>
          {chatInfo.bindToClass
            ? chatInfo.class.name
            : chatInfo.users.map((u) => u.name).join(", ")}
        </h2>
        <div className={styles.usersToggle}>
          <Menu {...menuBinds} icon={faUsers}>
            {chatInfo.users.map((u) => (
              <div key={u._id}>{u.name}</div>
            ))}
          </Menu>
        </div>
      </div>
      <div className={messageStyles.MessageWrapper}>
        <div className={messageStyles.MessageContent} ref={messageElem}>
          {/* div needed for default scroll to bottom */}
          <div>
            {dayMessages.length ? (
              dayMessages.map((day) => (
                <div key={day[0]} className={messageStyles.MessageGroup}>
                  <h4 className={messageStyles.date}>
                    {format(parseISO(day[0]), "d MMMM yyyy")}
                  </h4>
                  {day[1].map((message) => (
                    <div key={message._id}>
                      {message.type === "MESSAGE" && (
                        <div
                          className={classNames(
                            { [messageStyles.me]: message.me },
                            messageStyles.Message
                          )}
                        >
                          {message.header && (
                            <p className={messageStyles.header}>
                              <span className={messageStyles.author}>
                                {getNameById(message.author)}
                              </span>
                              <span className={messageStyles.time}>
                                {format(message.time, "h:mm aa")}
                              </span>
                            </p>
                          )}
                          <p className={messageStyles.text}>{message.text}</p>
                          {message.failed && (
                            <p
                              className={classNames(
                                "error",
                                messageStyles.retry
                              )}
                              onClick={() => handleRetryMessage(message._id)}
                            >
                              <FontAwesomeIcon icon={faRedo} /> Message failed
                              to send
                            </p>
                          )}
                        </div>
                      )}
                      {message.type === "NEW_SESSION" && (
                        <div className={messageStyles.SessionUpdates}>
                          <Link to={`/dashboard/sessions/${message.sessionId}`}>
                            <h4>
                              New Session created by{" "}
                              {getNameById(message.author)}
                            </h4>
                            <p>
                              {format(
                                message.sessionTime,
                                "d MMMM yyyy h:mm aa"
                              )}
                            </p>
                          </Link>
                        </div>
                      )}
                      {message.type === "NEW_SESSION_REQUEST" && (
                        <div className={messageStyles.SessionUpdates}>
                          <Link to={`/dashboard/sessions/${message.sessionId}`}>
                            <h4>
                              New Session requested by{" "}
                              {getNameById(message.author)}
                            </h4>
                            <p>
                              {format(
                                message.sessionTime,
                                "d MMMM yyyy h:mm aa"
                              )}
                            </p>
                          </Link>
                        </div>
                      )}
                      {message.type === "CANCEL_SESSION" && (
                        <div className={messageStyles.SessionUpdates}>
                          <Link to={`/dashboard/sessions/${message.sessionId}`}>
                            <h4>
                              Session cancelled by {getNameById(message.author)}
                            </h4>
                            <p>
                              {format(
                                message.sessionTime,
                                "d MMMM yyyy h:mm aa"
                              )}
                            </p>
                          </Link>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ))
            ) : (
              <div
                className={classNames(
                  messageStyles.MessageGroup,
                  messageStyles.NoMessages
                )}
              >
                There are no messages in this chat yet.
              </div>
            )}
          </div>
        </div>
      </div>
      <form onSubmit={handleSubmit} className={styles.messageField}>
        <input type="text" onChange={editMessage} value={message} />
        <button className="btn">Send</button>
      </form>
    </div>
  );
};

export default Chat;
