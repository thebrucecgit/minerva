import styled from "styled-components";

const validColor = "green";
const invalidColor = "red";

export const Signups = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;

  background-color: var(--main-gold-color);
`;

export const Main = styled.div`
  padding: 3rem;
`;

export const Form = styled.form`
  background: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
`;

export const Panel = styled.div`
  min-height: 100vh;
  padding: 3rem;
  box-sizing: border-box;
`;

export const SignupHeader = styled.div`
  padding: 1.2rem 1.5rem;
  font-size: 1.5rem;
  background-color: rgb(250, 250, 250);
  display: flex;
  h3 {
    margin: 0;
  }
`;

export const SignupBody = styled.div`
  overflow: hidden;
  transition: opacity 600ms ease;
  display: block;

  max-height: ${(props) => (props.closed ? "0" : "auto")};
  opacity: ${(props) => (props.closed ? "0" : "1")};
`;

export const SignupContent = styled(SignupBody)`
  padding: ${(props) => (props.closed ? "0" : "1rem 1.5rem")};

  input {
    max-width: 100%;
  }
`;

export const ErrorText = styled.p`
  color: ${invalidColor};

  &:not(:empty) + input,
  &:not(:empty) + textarea,
  &:not(:empty) + select {
    border-color: ${invalidColor};
  }
`;

export const Status = styled.div`
  margin-left: auto;
  margin-right: 0;
  color: ${(props) => (props.valid ? validColor : invalidColor)};
`;
