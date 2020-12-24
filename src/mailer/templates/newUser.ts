import Mail from 'nodemailer/lib/mailer';
import { User } from '../../entity/User';

export const newUser = (user: User, resetLink: string): Mail.Options => ({
  subject: 'Your account has been created - CRM',
  to: user.email,
  html: `
    <p>Dear ${user.firstName}</p>
    <p>
      A user has been created for you in the CRM system.<br/>
      This email address (${user.email}) will be your username <br/>
      Follow <a href=${resetLink}>this link</a> to set your password and start using the CRM system.<br/>
      The link expires in 7 days.
    </p>
  `,
});
