import styled from "styled-components";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";

const StyledModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  z-index: 5;
  width: 100%;
  height: 100%;
  min-height: 100vh;

  backdrop-filter: blur(2px) brightness(50%);

  display: flex;
  flex-direction: column;
  justify-content: center;
`;

const Box = styled.div`
  margin: 3rem auto;
  max-width: ${(props) => props.maxWidth};
  width: 100%;
  min-height: 200px;
  background: #fff;
  box-shadow: 0 0 20px rgba(0, 0, 0, 0.2);
  overflow: auto;

  display: flex;
  flex-direction: column;
`;

const CloseButton = styled.button`
  margin-top: 10px;
  margin-left: auto;
  margin-right: 10px;
  background: transparent;
`;

const Modal = ({ children, closeModal, open = false, maxWidth = "500px" }) => {
  if (!open) return null;

  return (
    <StyledModal>
      <Box maxWidth={maxWidth}>
        <CloseButton onClick={closeModal}>
          <FontAwesomeIcon icon={faTimes} size="2x" />
        </CloseButton>
        {children}
      </Box>
    </StyledModal>
  );
};

export default Modal;
