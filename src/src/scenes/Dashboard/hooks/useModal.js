import { useState, useCallback } from "react";

const useModal = (initial, name, { onOpen, onClose } = {}) => {
  const [open, setOpen] = useState(initial);

  const openModal = useCallback(
    (useHook) => {
      if (useHook && onOpen) onOpen(name);
      setOpen(true);
    },
    [onOpen, name]
  );

  const closeModal = useCallback(
    (useHook) => {
      if (useHook && onClose) onClose(name);
      setOpen(false);
    },
    [onClose, name]
  );

  const binds = {
    open,
    openModal,
    closeModal,
  };

  return [openModal, binds];
};

export default useModal;
