import nodemailer, { type Transporter } from 'nodemailer';
import { createAccountEmail } from '../views/createAccount.js';
import { recoverPassword } from '../views/recoverPassword.js';

interface EmailTemplate {
  subject: string;
  body: string;
}

interface SendEmailArgs {
  to?: string;
  templateName?: string;
  data?: Record<string, string | number | undefined>;
}

export class EmailManager {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
  }

  async getEmailTemplate(
    templateName: string,
    data: Record<string, string | number | undefined> = {},
  ): Promise<EmailTemplate | null> {
    if (!templateName) {
      throw new Error('Template name is required');
    }

    if (!data) {
      throw new Error('Data is required');
    }

    const createAccountTemplate = createAccountEmail(
      String(data.nombre ?? ''),
      String(data.password ?? ''),
      String(data.email ?? ''),
      String(data.role ?? ''),
    );

    const recoverPasswordTemplate = recoverPassword(
      String(data.nombre ?? ''),
      data.recoveryCode ?? '',
    );

    const templates: Record<string, EmailTemplate> = {
      createAccount: createAccountTemplate,
      recoverPassword: recoverPasswordTemplate,
    };

    return templates[templateName] || null;
  }

  async sendEmail({ to, templateName, data }: SendEmailArgs): Promise<{
    success: boolean;
    messageId: string;
  }> {
    if (!to || !templateName) {
      throw new Error('Recipient and template name are required');
    }

    const emailContent = await this.getEmailTemplate(templateName, data);
    if (!emailContent) {
      throw new Error('Email template not found');
    }

    const email = {
      from: process.env.SMTP_USER,
      to,
      subject: emailContent.subject,
      html: emailContent.body,
    };

    try {
      const info = await this.transporter.sendMail(email);
      return {
        success: true,
        messageId: info.messageId,
      };
    } catch (error) {
      throw new Error(`Error sending email: ${(error as Error).message}`);
    }
  }
}
