import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import { loader } from "graphql.macro";
import { useQuery } from "@apollo/react-hooks";
import { format, startOfDay, parseISO, differenceInMinutes } from "date-fns";
import classNames from "classnames";
import Menu from "../../../../components/Menu";
import useMenu from "../../../../hooks/useMenu";

import messageStyles from "./message.module.scss";
import styles from "../../styles.module.scss";

import { faUsers } from "@fortawesome/free-solid-svg-icons";

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

      ws.bind("MESSAGE", onMessage);

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
    const evt = sendMessage(channel, message);
    setMessage("");
    console.log(messages);
    evt.author = currentUser.user._id;
    console.log(evt);
    setMessages((st) => [...st, evt]);
    messageElem.current.scrollTop = messageElem.current.scrollHeight;
  };

  if (error) return <p className="error">{error.message}</p>;
  if (loading) return <p>Loading</p>;

  const chatInfo = data.getChat;

  const msgGroup = new Map();
  for (const message of messages) {
    const day = startOfDay(message.time).toISOString();
    if (msgGroup.has(day)) msgGroup.get(day).push(message);
    else msgGroup.set(day, [message]);
  }
  const dayMessages = [];
  for (const group of msgGroup) {
    for (let i = 0; i < group[1].length; i++) {
      if (
        group[1][i - 1]?.author === group[1][i].author &&
        (!group[1][i - 1] ||
          differenceInMinutes(group[1][i].time, group[1][i - 1].time) < 10)
      )
        group[1][i].header = false;
      else group[1][i].header = true;
      if (group[1][i].author === currentUser.user._id) group[1][i].me = true;
      else group[1][i].me = false;
    }
    dayMessages.push(group);
  }

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
            {dayMessages.map((day) => (
              <div key={day[0]} className={messageStyles.MessageGroup}>
                <h4 className={messageStyles.date}>
                  {format(parseISO(day[0]), "d MMMM, yyyy")}
                </h4>
                {day[1].map((message, ind) => (
                  <div
                    key={message._id ?? ind}
                    className={classNames(
                      { [messageStyles.me]: message.me },
                      messageStyles.Message
                    )}
                  >
                    {message.header && (
                      <p className={messageStyles.header}>
                        <span className={messageStyles.author}>
                          {
                            chatInfo.users.find((u) => u._id === message.author)
                              .name
                          }
                        </span>
                        <span className={messageStyles.time}>
                          {format(message.time, "h:mm aa")}
                        </span>
                      </p>
                    )}
                    <p className={messageStyles.text}>{message.text}</p>
                  </div>
                ))}
              </div>
            ))}
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
