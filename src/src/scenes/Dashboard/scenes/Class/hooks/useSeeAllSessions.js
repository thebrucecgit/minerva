import { toast } from "react-toastify";

export default function useSeeAllSessions(
  fetchAllSessions,
  setClassInfo,
  setLoadedAllSessions
) {
  let toastId;
  async function seeAllSessions() {
    try {
      toastId = toast("Fetching all sessions...", {
        autoClose: false,
      });

      const { data } = await fetchAllSessions({ sessionLimit: null });

      setClassInfo((st) => ({
        ...st,
        sessions: data.getClass,
      }));
      setLoadedAllSessions(true);

      toast.dismiss(toastId);
    } catch (e) {
      console.error(e);
      toast.update(toastId, {
        render: e.message,
        type: toast.TYPE.ERROR,
        autoClose: 5000,
      });
    }
  }
  return seeAllSessions;
}
