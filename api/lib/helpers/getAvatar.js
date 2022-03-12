import querystring from "querystring";

export default function getAvatar(name) {
  if (!name) throw new Error("No name");
  return `https://ui-avatars.com/api/?${querystring.stringify({
    size: "256",
    background: "a9e4f5",
    name,
  })}`;
}
