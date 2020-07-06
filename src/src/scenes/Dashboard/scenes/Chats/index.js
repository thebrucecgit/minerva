import React, { useState, useEffect } from "react";
import { loader } from "graphql.macro";
import { useQuery } from "@apollo/react-hooks";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import Loader from "../../../../components/Loader";
import { Switch, Route, NavLink } from "react-router-dom";

import Chat from "./components/Chat";

import styles from "./styles.module.scss";
import { ReactComponent as ChatPrompt } from "./media/undraw_team_chat.svg";

const GET_CHATS = loader("./graphql/GetChats.gql");

const Chats = ({ match: { path }, ws, currentUser }) => {
  const [chats, setChats] = useState([]);

  const { data, loading, error } = useQuery(GET_CHATS, {
    variables: {
      id: currentUser.user._id,
    },
  });

  useEffect(() => {
    if (data) {
      setChats(data.getUser.chats);
    }
  }, [data]);

  const sendMessage = (channel, text, id) => {
    const evt = {
      type: "MESSAGE",
      time: new Date(),
      text,
      channel,
      // server doesn't actually use these following values
      author: currentUser.user._id,
      _id: id ?? nanoid(11),
    };
    try {
      ws.trigger(evt);
    } catch (e) {
      evt.failed = true;
      toast.error("Message failed to send.");
    } finally {
      setChats((chats) => {
        const newChats = [...chats];
        newChats.find((chat) => chat.channel === channel).messages.push(evt);
        return newChats;
      });
      return evt;
    }
  };

  if (error) return <p>{error.message}</p>;
  if (loading) return <Loader />;

  return (
    <div className={styles.Chats}>
      <div className={styles.chatList}>
        {chats.map((chat) => (
          <NavLink
            to={`${path}/${chat.channel}`}
            activeClassName={styles.active}
            key={chat.channel}
            className={styles.chatName}
          >
            <button className="btn secondary">
              <h4>
                {chat.bindToClass
                  ? chat.class.name
                  : chat.users.map((u) => u.name).join(", ")}
              </h4>
              {/* display last message */}
              {chat.messages.length > 0 && (
                <p>{`${
                  chat.users.find(
                    (u) =>
                      u._id === chat.messages[chat.messages.length - 1].author
                  ).name
                }: ${chat.messages[chat.messages.length - 1].text}`}</p>
              )}
            </button>
          </NavLink>
        ))}
      </div>
      <Switch>
        <Route exact path={path}>
          <div className={styles.noselection}>
            <h2>Select a chat on the left</h2>
            <ChatPrompt />
          </div>
        </Route>
        <Route exact path={`${path}/:channel`}>
          <Chat sendMessage={sendMessage} ws={ws} currentUser={currentUser} />
        </Route>
      </Switch>
    </div>
  );
};

export default Chats;
