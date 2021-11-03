import querystring from "querystring";

export default function getAvatar(name) {
  if (!name) throw new Error("No name");
  return `https://ui-avatars.com/api/?${querystring.stringify({
    size: "256",
    background: "fff9bf",
    name,
  })}`;
}
