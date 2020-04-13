import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useHistory } from "react-router-dom";

const LOGIN = gql`
  query Login($email: String, $password: String, $tokenId: String) {
    login(email: $email, password: $password, tokenId: $tokenId) {
      jwt
      exp
      registered
      user {
        name
      }
    }
  }
`;

const REGISTER = gql`
  enum UserType {
    TUTOR
    TUTEE
  }

  mutation Register(
    $userType: UserType!
    $name: String!
    $email: String!
    $password: String
    $pfp: String!
    $yearGroup: Int!
    $school: String!
    $academics: [String!]!
    $extras: [String!]
    $biography: String!
    $grades: String!
  ) {
    register(
      userType: $userType
      name: $name
      email: $email
      password: $password
      pfp: $pfp
      yearGroup: $yearGroup
      school: $school
      academics: $academics
      extras: $extras
      biography: $biography
      grades: $grades
    ) {
      jwt
      registered
    }
  }
`;

/**
 * Authentication Service provider
 * @param {object} props
 * @param {object.children} children
 */

function Authentication({ children }) {
  const history = useHistory();

  const [registerReq] = useMutation(REGISTER);

  async function register(info) {
    const { data: userInfo, error } = await registerReq({ variables: info });
    if (error) throw error;
    localStorage.setItem("Auth", JSON.stringify(userInfo));
    return userInfo;
  }

  const { refetch: loginReq } = useQuery(LOGIN, {
    skip: true,
    errorPolicy: "all",
  });

  /**
   * Logs user in and stores and returns userInfo
   * @param {string} emailOrTokenId Google tokenId or email
   * @param {string} password Password (only if email is used above)
   * @return {Promise<object>} userInfo
   */

  async function login(emailOrTokenId, password) {
    const variables = password
      ? { email: emailOrTokenId, password }
      : { tokenId: emailOrTokenId };
    const { data: userInfo, error } = await loginReq(variables);
    if (error) throw error;
    localStorage.setItem("Auth", JSON.stringify(userInfo));
    return userInfo;
  }

  function logout() {
    localStorage.removeItem("Auth");
    history.replace("/");
  }

  const authService = {
    register,
    login,
    logout,
    get currentUser() {
      const userInfoJSON = localStorage.getItem("Auth");
      if (!userInfoJSON) return null;
      const userInfo = JSON.parse(userInfoJSON);
      if (Date.now() > userInfo.exp) return logout();
      else return userInfo;
    },
  };

  return children(authService);
}

export default Authentication;
