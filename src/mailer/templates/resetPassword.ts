import Mail from 'nodemailer/lib/mailer';
import { User } from '../../entity/User';

export const resetPassword = (user: User, resetLink: string): Mail.Options => ({
  subject: 'Reset your password - CRM',
  to: user.email,
  from: process.env.MAIL_FROM,
  html: `
    <p>Dear ${user.firstName}</p>
    <p>
      You requested to reset your password.<br/>
      You can do so with <a href="${resetLink}">this link</a>.<br/>
      The link expires in 7 days.
    </p>
  `,
});
