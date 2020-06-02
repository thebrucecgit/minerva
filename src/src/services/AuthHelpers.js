import { useState } from "react";
import { useHistory } from "react-router-dom";
import { toast } from "react-toastify";

const AuthHelpers = ({ children }) => {
  const history = useHistory();

  const [currentUser, setCurrentUser] = useState(() => {
    const userInfoJSON = localStorage.getItem("Auth");
    if (!userInfoJSON) return null;
    const currentUser = JSON.parse(userInfoJSON);
    if (Date.now() > currentUser.exp * 1000) {
      toast("You were signed out as your login has expired.", {
        autoClose: false,
      });
      localStorage.removeItem("Auth");
      history.replace("/");
      return null;
    } else return currentUser;
  });

  function logout() {
    setCurrentUser(null);
    localStorage.removeItem("Auth");
    history.replace("/");
  }

  function storeUserInfo(userInfo) {
    localStorage.setItem("Auth", JSON.stringify(userInfo));

    if (!userInfo) return;

    if (Date.now() > userInfo.exp * 1000) {
      toast("You were signed out as your login has expired.");
      logout();
    } else setCurrentUser(userInfo);
  }

  return children({
    logout,
    currentUser,
    storeUserInfo,
  });
};

export default AuthHelpers;
