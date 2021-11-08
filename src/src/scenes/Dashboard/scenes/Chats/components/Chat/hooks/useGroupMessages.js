import { useMemo } from "react";
import { startOfDay, differenceInMinutes } from "date-fns";

export default function useGroupMessages(messages, currentUser) {
  const dayMessages = useMemo(() => {
    if (!messages.length) return [];
    const msgGroup = new Map();
    for (const message of messages) {
      const day = startOfDay(message.time).toISOString();
      if (msgGroup.has(day)) msgGroup.get(day).push(message);
      else msgGroup.set(day, [message]);
    }
    const result = [];
    for (const m of msgGroup) {
      const group = m[1].map((g, i) => ({
        ...g,
        header: !(
          m[1][i - 1]?.author === m[1][i].author &&
          (!m[1][i - 1] ||
            differenceInMinutes(m[1][i].time, m[1][i - 1].time) < 10)
        ),
        me: m[1][i].author === currentUser.user._id,
      }));
      result.push([m[0], group]);
    }
    return result;
  }, [messages, currentUser]);
  return dayMessages;
}
