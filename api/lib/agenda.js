import Agenda from "agenda";

import email from "./jobs/email";
import search from "./jobs/search";

const agenda = new Agenda();

export async function agendaSetup(mongo) {
  agenda.mongo(mongo);

  email(agenda);
  search(agenda);

  await agenda.start();
}

export default agenda;
