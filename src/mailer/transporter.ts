import { createTransport } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export const createTransporter = () => {
  return createTransport({
    host: process.env.MAIL_HOST!,
    port: parseInt(process.env.MAIL_PORT!, 10),
    secure: true,
    auth: {
      user: process.env.MAIL_USER!,
      pass: process.env.MAIL_PASSWORD!,
    },
    from: process.env.MAIL_FROM,
  } as SMTPTransport.Options);
};
