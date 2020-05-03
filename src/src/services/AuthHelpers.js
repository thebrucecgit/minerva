import { useHistory } from "react-router-dom";

const AuthHelpers = ({ children }) => {
  const history = useHistory();

  const logout = () => {
    localStorage.removeItem("Auth");
    history.replace("/");
  };

  return children({
    logout,
    get currentUser() {
      const userInfoJSON = localStorage.getItem("Auth");
      if (!userInfoJSON) return null;
      const userInfo = JSON.parse(userInfoJSON);

      if (Date.now() > userInfo.exp * 1000) return logout();
      else return userInfo;
    },
  });
};

export default AuthHelpers;
