import { useEffect } from "react";
import Modal from "components/Modal";
import styled from "styled-components";

import studentHandbookPreview from "../media/student-handbook-preview.png";

const Content = styled.div`
  padding: 1rem;
`;

export default function Onboarding({ currentUser, ...binds }) {
  let contentType = "TUTEE";
  if (currentUser.user.tutor?.status === "COMPLETE")
    contentType = "TUTOR_CONFIRMED";
  else if (currentUser.user.tutor?.status === "PENDING_REVIEW")
    contentType = "TUTOR_PENDING";

  useEffect(() => {
    const onboarded = localStorage.getItem("onboarded");
    if (onboarded === contentType) return;
    binds.openModal();

    return binds.closeModal;
  }, [contentType, binds]);

  let content = (
    <>
      <h2>Welcome to Minerva!</h2>
      <p>
        Please get started by reading the{" "}
        <a href="/files/student-handbook.pdf" target="_blank">
          student handbook
        </a>
        .
      </p>
      <a href="/files/student-handbook.pdf" target="_blank">
        <img
          src={studentHandbookPreview}
          alt="student handbook preview"
          width="200px"
        />
      </a>
    </>
  );
  if (contentType === "TUTOR_CONFIRMED") {
    content = (
      <>
        <h2>Welcome to Minerva!</h2>
        <p>
          You are approved as a tutor. Please get started by having a read of
          the{" "}
          <a href="/files/tutor-handbook.pdf" target="_blank">
            tutor handbook
          </a>
          .
        </p>
      </>
    );
  } else if (contentType === "TUTOR_PENDING") {
    content = (
      <>
        <h2>Welcome to Minerva!</h2>
        <p>
          Your application to become a tutor is being processed. Meanwhile, feel
          free to have a wonder around the platform.
        </p>
        <p>Your profile will not appear in search until it is approved.</p>
      </>
    );
  }

  function closeModal() {
    localStorage.setItem("onboarded", contentType);
    binds.closeModal();
  }

  return (
    <Modal {...binds} maxWidth="800px" closeModal={closeModal}>
      <Content>{content}</Content>
    </Modal>
  );
}
