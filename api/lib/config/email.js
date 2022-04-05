import sgMail from "@sendgrid/mail";

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

const defaults = {
  from: {
    email: "no-reply@minervaeducation.co.nz",
    name: "Minerva Education",
  },
};

export default async function send(data) {
  return await sgMail.send({
    ...defaults,
    ...data,
  });
}
