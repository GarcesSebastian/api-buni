import path from 'path';
import { createAccountEmail } from '../views/createAccount.js';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

export class EmailManager {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
        });
    }

    async getEmailTemplate(templateName, data = {}) {
        if (!templateName) {
            throw new Error("Template name is required");
        }

        if(!data) {
            throw new Error("Data is required");
        }

        if (!data.nombre || !data.password || !data.email || !data.role) {
            throw new Error("All fields are required in data");
        }

        const createAccountTemplate = await createAccountEmail(
            data.nombre, 
            data.password, 
            data.email, 
            data.role
        );

        const templates = {
            createAccount: createAccountTemplate,
        };

        return templates[templateName] || null;
    }

    async sendEmail({to, templateName, data}) {
        if (!to || !templateName) {
            throw new Error("Recipient and template name are required");
        }

        const emailContent = await this.getEmailTemplate(templateName, data);
        if (!emailContent) {
            throw new Error("Email template not found");
        }

        const email = {
            from: process.env.SMTP_USER,
            to,
            subject: emailContent.subject,
            html: emailContent.body
          };

        try {
            const info = await this.transporter.sendMail(email);
            return {
                success: true,
                messageId: info.messageId
            };
        } catch (error) {
            throw new Error(`Error sending email: ${error.message}`);
        }
    }
}