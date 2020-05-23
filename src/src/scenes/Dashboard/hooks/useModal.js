import { useState } from "react";

const useModal = (initial, name, { onOpen, onClose }) => {
  const [open, setOpen] = useState(initial);

  function openModal(useHook) {
    if (useHook) onOpen(name);
    setOpen(true);
  }

  function closeModal(useHook) {
    if (useHook) onClose(name);
    setOpen(false);
  }

  const binds = {
    open,
    onClose: closeModal,
  };

  return [openModal, binds];
};

export default useModal;
