import { EmailManager } from "../lib/EmailManager.js";

export const sendEmail = async (req, res) => {
    const { to, templateName, data } = req.body;

    if (!to || !templateName) {
        return res.status(400).json({ error: "Recipient and template name are required" });
    }

    try {
        const emailManager = new EmailManager();
        const emailSent = await emailManager.sendEmail({to, templateName, data});

        if (emailSent) {
            return res.status(200).json({ message: "Email sent successfully" });
        } else {
            return res.status(500).json({ error: "Failed to send email" });
        }
    } catch (error) {
        console.error("Error sending email:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
}