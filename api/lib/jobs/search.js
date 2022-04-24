import { indexAll } from "../config/search";

export default function SearchJob(agenda) {
  agenda.define("reindex search", async () => {
    await indexAll();
  });

  agenda.every("1 day", "reindex search");
}
