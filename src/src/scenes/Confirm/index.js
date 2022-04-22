function Confirm({ authService }) {
  const { currentUser } = authService;

  return (
    <div>
      <h1>Welcome to Minerva!</h1>
      <p>
        You are only a few more clicks away from completing registration. Please
        confirm your email address (<em>{currentUser.user?.email}</em>) by
        checking your inbox.
      </p>
      <p>
        Please allow up to 10 minutes for the email to arrive, and check your
        spam folder as well.
      </p>
    </div>
  );
}

export default Confirm;
