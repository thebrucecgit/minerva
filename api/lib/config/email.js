import sgMail from "@sendgrid/mail";

const { SENDGRID_API_KEY } = process.env;

sgMail.setApiKey(SENDGRID_API_KEY);

export default sgMail;
