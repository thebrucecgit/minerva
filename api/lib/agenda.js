import Agenda from "agenda";

import email from "./jobs/email";
import search from "./jobs/search";

let agenda;

export async function agendaSetup(mongo) {
  agenda = new Agenda({ mongo });

  email(agenda);
  search(agenda);

  // agenda.schedule("in 15 minutes", "session reminder", {
  //   sessionId: "FgB5du7UCSI",
  // });
  // console.log(
  //   await agenda.cancel({
  //     name: "session reminder",
  //     "data.sessionId": "FgB5du7UCSI",
  //   })
  // );

  await agenda.start(); // Returns a promise, which should be handled appropriately
}

export default agenda;
