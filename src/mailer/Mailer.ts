import Mail from 'nodemailer/lib/mailer';
import { createTransporter } from './transporter';

interface SentMessageInfo {
  messageId: string;
}

/**
 * Singleton class to handle all mail-related operations
 */
export class Mailer {
  static instance: Mailer;

  transporter: Mail;

  constructor() {
    this.transporter = createTransporter();
  }

  static getInstance(): Mailer {
    if (this.instance === undefined) {
      this.instance = new Mailer();
    }
    return this.instance;
  }

  async send(mail: Mail.Options) {
    try {
      const info = (await this.transporter.sendMail(mail)) as SentMessageInfo;
      console.info('Message sent: %s', info.messageId);
    } catch (e) {
      console.error(e);
    }
  }
}
