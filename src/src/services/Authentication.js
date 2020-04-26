import { gql } from "apollo-boost";
import { useQuery, useMutation } from "@apollo/react-hooks";
import { useHistory } from "react-router-dom";

const LOGIN = gql`
  query Login($email: String, $password: String, $tokenId: String) {
    login(email: $email, password: $password, tokenId: $tokenId) {
      jwt
      exp
      user {
        name
        pfp
        email
        registrationStatus
      }
    }
  }
`;

const REGISTER = gql`
  mutation Register(
    $userType: UserType!
    $name: String!
    $email: String!
    $password: String
    $pfp: String
    $yearGroup: Int!
    $school: String!
    $academics: [String!]!
    $extras: [String!]
    $biography: String!
    $grades: String!
    $token: String!
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
      token: $token
    ) {
      jwt
      exp
      user {
        name
        pfp
        email
        registrationStatus
      }
    }
  }
`;

const CONFIRM_EMAIL = gql`
  mutation ConfirmUserEmail($emailConfirmId: String!) {
    confirmUserEmail(emailConfirmId: $emailConfirmId) {
      jwt
      exp
      user {
        name
        pfp
        email
        registrationStatus
      }
    }
  }
`;

const RESET_PASSWORD = gql`
  mutation ResetPassword($email: String!) {
    resetPassword(email: $email)
  }
`;

const UPDATE_PASSWORD = gql`
  mutation UpdatePassword(
    $email: String!
    $passwordResetCode: Int!
    $newPassword: String!
  ) {
    updatePassword(
      email: $email
      passwordResetCode: $passwordResetCode
      newPassword: $newPassword
    ) {
      jwt
      exp
      user {
        name
        pfp
        email
        registrationStatus
      }
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
  const [confirmEmailReq] = useMutation(CONFIRM_EMAIL);
  const [resetPasswordReq] = useMutation(RESET_PASSWORD);
  const [updatePasswordReq] = useMutation(UPDATE_PASSWORD);

  async function storeUserInfo(userInfo) {
    localStorage.setItem("Auth", JSON.stringify(userInfo));
  }

  async function register(info) {
    const { data, error } = await registerReq({ variables: info });
    if (error) throw error;

    const userInfo = data.register;
    storeUserInfo(userInfo);
    return userInfo;
  }

  const { refetch: loginReq } = useQuery(LOGIN, {
    skip: true,
  });

  async function confirmUserEmail(emailConfirmId) {
    const { data, error } = await confirmEmailReq({
      variables: { emailConfirmId },
    });
    if (error) throw error;

    const userInfo = data.confirmUserEmail;
    storeUserInfo(userInfo);
    return userInfo;
  }

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
    const { data, error } = await loginReq(variables);
    if (error) throw error;

    const userInfo = data.login;
    storeUserInfo(userInfo);
    return userInfo;
  }

  function logout() {
    localStorage.removeItem("Auth");
    history.replace("/");
  }

  async function resetPassword(email) {
    const { error } = await resetPasswordReq({ variables: { email } });
    if (error) throw error;
  }

  async function updatePassword(variables) {
    const { error, data } = await updatePasswordReq({ variables });
    if (error) throw error;

    const userInfo = data.updatePassword;
    storeUserInfo(userInfo);
    return userInfo;
  }

  const authService = {
    register,
    login,
    logout,
    confirmUserEmail,
    resetPassword,
    updatePassword,
    get currentUser() {
      const userInfoJSON = localStorage.getItem("Auth");
      if (!userInfoJSON) return null;
      const userInfo = JSON.parse(userInfoJSON);

      if (Date.now() > userInfo.exp * 1000) return logout();
      else return userInfo;
    },
  };

  return children(authService);
}

export default Authentication;
