// retrieves a link for video call
import axios from "axios";

export default async function fetchCallLink(name) {
  const { data } = await axios({
    method: "post",
    url: "https://api.join.skype.com/v1/meetnow/guest",
    data: {
      title: name,
    },
  });
  return data.joinLink;
}
