// mail.service.ts
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;

  constructor(private configService: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.configService.get<string>('services.mailerHost'),
      // host: 'smtp.netfirms.com',
      port: 587,
      secure: false, // STARTTLS
      auth: {
        user: this.configService.get<string>('services.mailerUser'),
        // user: 'info@redcastlecard.com',
        // pass: 'Ahly@6161',
        pass: this.configService.get<string>('services.mailerPassword'),
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
      from: this.configService.get<string>('services.mailerUser'),
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