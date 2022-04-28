import Session from "../modules/session/model";
import send from "../config/email";
import datetime from "../config/datetime";

const { FRONTEND_DOMAIN } = process.env;

export default function EmailJob(agenda) {
  // 24 hours before the session start time,
  // send the student and tutor a reminder email.
  // If the session isn’t confirmed, remind them to confirm.
  agenda.define("session reminder", async (job) => {
    const session = await Session.findById(job.attrs.data.sessionId)
      .populate("tutees", "name email")
      .populate("tutors", "name email");
    if (!session || !["CONFIRM", "UNCONFIRM"].includes(session.status)) return;

    const sessionTime = datetime.format(session.startTime);
    await send({
      templateId: "d-d867c7cf97554e8f91a1924aac07e020",
      subject: "Session Reminder",
      dynamicTemplateData: {
        sessionName: session.name,
        sessionTime,
        sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
      },
      personalizations: session.users.map((user) => ({
        to: {
          email: user.email,
          name: user.name,
        },
        dynamicTemplateData: {
          name: user.name,
        },
      })),
    });
  });

  // After session concludes, both the student and tutor
  // receives an email asking them to review the session
  agenda.define("session review reminder", async (job) => {
    const session = await Session.findById(job.attrs.data.sessionId)
      .populate("tutees", "name email")
      .populate("tutors", "name email");
    if (!session || session.status !== "CONFIRM") return;

    const sessionTime = datetime.format(session.startTime);

    const personalizations = session.users
      .filter((u) => {
        if (session.tutors.some((t) => t._id.isEqual(u._id))) {
          return !session.tutorReviews.some((r) => r.user._id.isEqual(u._id));
        } else {
          return !session.tuteeReviews.some((r) => r.user._id.isEqual(u._id));
        }
      })
      .map((user) => ({
        to: {
          email: user.email,
          name: user.name,
        },
        dynamicTemplateData: {
          name: user.name,
        },
      }));

    if (personalizations.length === 0) return;
    await send({
      templateId: "d-d471442891424c719afa77c73b3c9752",
      dynamicTemplateData: {
        sessionName: session.name,
        sessionTime,
        sessionURL: `${FRONTEND_DOMAIN}/dashboard/sessions/${session._id}`,
      },
      personalizations,
    });
  });
}
