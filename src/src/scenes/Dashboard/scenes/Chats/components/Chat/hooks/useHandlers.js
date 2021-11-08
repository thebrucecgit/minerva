export default function useHandlers({
  message,
  channel,
  sendMessage,
  setMessage,
  setMessages,
  messageElem,
}) {
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (message.length === 0) return;
    const evt = sendMessage(channel, message);
    evt.loading = true;
    console.log(evt);
    setMessage("");
    setMessages((st) => [...st, evt]);
    messageElem.current.scrollTop = messageElem.current.scrollHeight;
  };

  const handleRetry = (id) => {
    setMessages((st) => {
      // No idea why this works
      const state = [...st];
      const msg = state.find((msg) => msg._id === id);
      const { failed, time } = sendMessage(channel, msg.text, id);
      msg.failed = failed;
      msg.time = time;
      return state;
    });
  };

  return [handleSubmit, handleRetry];
}
