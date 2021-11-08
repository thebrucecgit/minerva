import { NavLink } from "react-router-dom";
import styled from "styled-components";
import scrollbar from "styles/scrollbar";
import mediaQuery from "styles/sizes";

export const StyledChat = styled.div`
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

export const ChatHeader = styled.div`
  display: flex;
  padding: 0 1rem;
  color: #fff;
  background-color: #000;

  h2 {
    margin: 1rem 0;
  }
`;

export const ChatHeaderUsers = styled.div`
  margin-left: auto;
`;

export const ChatMessageInput = styled.form`
  display: flex;
  input {
    margin: 10px 0;
    max-width: 100%;
    margin-right: 10px;
  }
`;

export const MessageContent = styled.div`
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

export const MessageGroup = styled.div`
  padding: 1rem 2rem;
`;

export const NoMessages = styled(MessageGroup)`
  text-align: center;
`;

export const DateBreaker = styled.h4`
  font-weight: normal;
  width: 100%;
  text-align: center;
`;

export const BackButton = styled(NavLink)`
  margin-right: 1rem;
  ${mediaQuery("lg")`
    display: none;
  `}
`;

export const FetchLoad = styled.div`
  display: flex;
  justify-content: center;
  padding: 0.5rem;
`;

export const FetchMore = styled.div`
  height: 1rem;
`;
