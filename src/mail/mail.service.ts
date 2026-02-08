// mail.service.ts
import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      // host: 'smtp.netfirms.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: process.env.MAIL_USERNAME,
        // user: 'info@redcastlecard.com',
        // pass: 'Ahly@6161',
        pass: process.env.MAIL_PASSWORD,
  },
  tls: {
    rejectUnauthorized: false, // <-- ignore self-signed cert
  },

    });
  }

  async sendMail(reqBody: {
    to: string[]; // now array
    cc?: string[];
    bcc?: string[];
    subject: string;
    text?: string;
    html?: string;
    attachments?: { filename: string; path: string }[];
  }) {
    const { to, cc, bcc, subject, text, html, attachments } = reqBody;

    await this.transporter.sendMail({
      from: process.env.MAIL,
      to: to.join(', '), 
      ...(cc && { cc: cc.join(', ') }),
      ...(bcc && { bcc: bcc.join(', ') }),
      subject,
      ...(text && { text }),
      ...(html && { html }),
      ...(attachments && { attachments }),
    });
    
    return { result: 'send successfully', error: undefined };
  }

}