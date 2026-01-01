import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {
  private transporter: nodemailer.Transporter;
  private from: string;

  constructor(private readonly config: ConfigService) {
    const host = this.config.get<string>('SMTP_HOST')!;
    const port = parseInt(this.config.get<string>('SMTP_PORT') || '1025', 10);
    this.from = this.config.get<string>('SMTP_FROM') || 'no-reply@netflix-mvp.local';

    this.transporter = nodemailer.createTransport({
      host,
      port,
      secure: false,
    });
  }

  async sendVerificationEmail(to: string, verifyUrl: string) {
    await this.transporter.sendMail({
      from: this.from,
      to,
      subject: 'Verify your Netflix MVP account',
      html: `
        <div style="font-family: Arial, sans-serif">
          <h2>Verify your email</h2>
          <p>Click the link to activate your account:</p>
          <p><a href="${verifyUrl}">${verifyUrl}</a></p>
          <p>If you didn't request this, you can ignore this email.</p>
        </div>
      `,
    });
  }
}
