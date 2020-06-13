import { useState, useEffect } from "react";

import Pusher from "pusher-js";
import PusherBatchAuthorizer from "pusher-js-auth";

const {
  REACT_APP_BACKEND_URI,
  REACT_APP_PUSHER_KEY,
  REACT_APP_PUSHER_CLUSTER,
} = process.env;

const usePusher = (currentUser) => {
  const [pusher, setPusher] = useState(null);

  useEffect(() => {
    setPusher(
      new Pusher(REACT_APP_PUSHER_KEY, {
        cluster: REACT_APP_PUSHER_CLUSTER,
        authEndpoint: `${REACT_APP_BACKEND_URI}/chat/auth`,
        auth: {
          params: {
            jwt: currentUser.jwt,
          },
        },
        // authorizer: PusherBatchAuthorizer,
      })
    );
  }, [currentUser.jwt]);

  return pusher;
};

export default usePusher;
