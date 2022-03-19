import { useState } from "react";

export default function useCreateSession() {
  const [isOpen, setIsOpen] = useState(false);
  const [users, setUsers] = useState([]);
  const create = (users) => {
    setIsOpen(true);
    setUsers(users);
  };
  return {
    isOpen,
    create,
    close: () => {
      setIsOpen(false);
    },
    users,
  };
}
