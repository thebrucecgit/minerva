import Authenticated from "components/Authenticated";
import { useState } from "react";

function Confirm({ authService }) {
  const { currentUser } = authService;

  const [loaded, setLoaded] = useState(false);
  if (!loaded)
    return (
      <Authenticated
        registrationStatus={currentUser?.user?.registrationStatus}
        exclude={["confirm"]}
        onLoad={() => setLoaded(true)}
      />
    );

  return (
    <div>
      <h1>Welcome to Academe</h1>
      <p>
        You are only a few more clicks away from completing registration. Please
        confirm your email address (<em>{currentUser.user.email}</em>) by
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
