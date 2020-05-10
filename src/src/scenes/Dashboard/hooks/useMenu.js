import { useState } from "react";

const useMenu = (initialValue) => {
  const [menuOpen, setMenuOpen] = useState(initialValue);

  const rootClick = () => {
    setMenuOpen(false);
  };

  const toggleMenu = (e) => {
    e.stopPropagation();
    setMenuOpen((st) => !st);
  };

  const bind = {
    menuOpen,
    toggleMenu,
  };

  return [rootClick, bind];
};

export default useMenu;
