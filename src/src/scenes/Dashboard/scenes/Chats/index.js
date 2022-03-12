import React, { useState } from "react";
import { loader } from "graphql.macro";
import { useQuery } from "@apollo/client";
import { toast } from "react-toastify";
import { nanoid } from "nanoid";
import Loader from "../../../../components/Loader";
import Error from "../../../../components/Error";
import { Switch, Route, NavLink, useRouteMatch } from "react-router-dom";

import Chat from "./components/Chat";

import scrollbar from "styles/scrollbar";
import styled from "styled-components";
import mediaQuery from "styles/sizes";
import { ReactComponent as ChatPrompt } from "./media/undraw_work_chat.svg";

const StyledChats = styled.div`
  height: 100vh;
  width: 100vw;
  box-sizing: border-box;
  ${mediaQuery("lg")`
    grid-template-columns: 40% 60%;
    width: auto;
    display: grid;
    position: relative;
  `}

  ${scrollbar}
`;

const ChatList = styled.div`
  height: 100vh;
  width: 100vw;
  background-image: url(../../../../media/geometry.png);
  overflow-y: auto;
  padding: 0 1rem;
  background: white;
  position: fixed;

  ${mediaQuery("lg")`
    width: auto;
    position: relative;
  `}

  h4 {
    font-size: 1.7rem;
    margin: 10px 0;
  }
  p {
    margin: 10px 0;
  }
`;

const ChatName = styled(NavLink)`
  display: block;
  margin: 0.5rem 0;

  button {
    text-align: left;
    width: 100%;
  }

  &.active button {
    background: linear-gradient(
      to right,
      rgba(230, 230, 230, 1) 0%,
      rgba(240, 240, 240, 1) 100%
    );
  }
`;

const NoSelection = styled.div`
  background: rgb(240, 240, 240);
  padding: 2rem;
  h2 {
    margin-bottom: 2rem;
  }
  display: none;
  ${mediaQuery("lg")`
    display: block;
  `}
`;

const GET_CHATS = loader("./graphql/GetChats.gql");

const chatSort = (a, b) => {
  return (
    b.messages[b.messages.length - 1].time -
    a.messages[a.messages.length - 1].time
  );
};

const Chats = ({ match: { path }, ws, currentUser }) => {
  const [chats, setChats] = useState([]);

  const { loading, error } = useQuery(GET_CHATS, {
    variables: {
      userID: currentUser.user._id,
    },
    onCompleted: (data) => {
      setChats([...data.getChatsOfUser].sort(chatSort));
    },
  });

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
        return chats
          .map((chat) => {
            if (chat.channel === channel)
              return { ...chat, messages: [...chat.messages, evt] };
            return chat;
          })
          .sort(chatSort);
      });
      return evt;
    }
  };

  const { isExact: showChatlist } = useRouteMatch(path);

  if (error) return <Error error={error} />;
  if (loading) return <Loader />;

  return (
    <StyledChats>
      <ChatList mobileShow={showChatlist}>
        {chats.map((chat) => (
          <ChatName
            to={`${path}/${chat.channel}`}
            activeClassName="active"
            key={chat.channel}
          >
            <button className="btn secondary">
              <h4>
                {chat.bindToClass
                  ? chat.class.name
                  : chat.users.map((u) => u.name).join(", ")}
              </h4>
              {/* display last message */}
              {chat.messages.length > 0 &&
                chat.messages[chat.messages.length - 1].type === "MESSAGE" && (
                  <p>{`${
                    chat.users.find(
                      (u) =>
                        u._id === chat.messages[chat.messages.length - 1].author
                    ).name
                  }: ${chat.messages[chat.messages.length - 1].text.slice(
                    0,
                    100
                  )}`}</p>
                )}
            </button>
          </ChatName>
        ))}
      </ChatList>
      <Switch>
        <Route exact path={path}>
          <NoSelection>
            <h2>Select a chat on the left</h2>
            <ChatPrompt />
          </NoSelection>
        </Route>
        <Route exact path={`${path}/:channel`}>
          <Chat sendMessage={sendMessage} ws={ws} currentUser={currentUser} />
        </Route>
      </Switch>
    </StyledChats>
  );
};

export default Chats;
