import type { Request, Response } from 'express';
import { EmailManager } from '../lib/EmailManager.js';

export const sendEmail = async (req: Request, res: Response) => {
  const { to, templateName, data } = req.body as {
    to?: string;
    templateName?: string;
    data?: Record<string, string | number | undefined>;
  };

  if (!to || !templateName) {
    return res.status(400).json({ error: 'Recipient and template name are required' });
  }

  try {
    const emailManager = new EmailManager();
    const emailSent = await emailManager.sendEmail({ to, templateName, data });

    if (emailSent) {
      return res.status(200).json({ message: 'Email sent successfully' });
    } else {
      return res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Error sending email:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
