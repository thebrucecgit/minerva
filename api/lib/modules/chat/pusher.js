import Pusher from "pusher";

const { PUSHER_APPID, PUSHER_KEY, PUSHER_SECRET, PUSHER_CLUSTER } = process.env;

const pusher = new Pusher({
  appId: PUSHER_APPID,
  key: PUSHER_KEY,
  secret: PUSHER_SECRET,
  cluster: PUSHER_CLUSTER,
  // encrypted: true,
});

export default pusher;
