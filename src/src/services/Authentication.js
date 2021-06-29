import { loader } from "graphql.macro";
import { useQuery, useMutation } from "@apollo/client";

const LOGIN = loader("./graphql/Login.gql");
const REGISTER = loader("./graphql/Register.gql");
const CONFIRM_EMAIL = loader("./graphql/ConfirmEmail.gql");
const RESET_PASSWORD = loader("./graphql/ResetPassword.gql");
const UPDATE_PASSWORD = loader("./graphql/UpdatePassword.gql");

/**
 * Authentication Service provider
 * @param {object} props
 * @param {object.children} children
 */

function Authentication({ authHelpers, children }) {
  const [registerReq] = useMutation(REGISTER);
  const [confirmEmailReq] = useMutation(CONFIRM_EMAIL);
  const [resetPasswordReq] = useMutation(RESET_PASSWORD);
  const [updatePasswordReq] = useMutation(UPDATE_PASSWORD);

  const { storeUserInfo } = authHelpers;

  async function register(info) {
    const { data, error } = await registerReq({ variables: info });
    if (error) throw error;

    const userInfo = data.register;
    storeUserInfo(userInfo);
    return userInfo;
  }

  const { refetch: loginReq } = useQuery(LOGIN, {
    skip: true,
    fetchPolicy: "no-cache",
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
    confirmUserEmail,
    resetPassword,
    updatePassword,
    ...authHelpers,
  };

  return children(authService);
}

export default Authentication;
