const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
    try {
        const emailUser = process.env.EMAIL_USER?.trim();
        const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, '');

        if (!emailUser || !emailPass) {
            console.log('[EMAIL] ERROR: EMAIL_USER or EMAIL_PASS is missing in Railway Variables.');
            return { success: false, message: 'Missing credentials' };
        }

        console.log(`[EMAIL] Starting transport to ${to} (User: ${emailUser})...`);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // Use SSL for port 465
            auth: {
                user: emailUser,
                pass: emailPass
            },
            // CRITICAL: Deep logging to see WHY it timeouts in Railway logs
            logger: true,
            debug: true,
            connectionTimeout: 30000, // 30 seconds
            greetingTimeout: 30000,
            socketTimeout: 30000
        });

        const mailOptions = {
            from: `"Khmer Download" <${emailUser}>`,
            to,
            subject,
            html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] SENT SUCCESS! ID: ${result.messageId}`);
        return { success: true };
    } catch (error) {
        console.error('[EMAIL FAIL]:', error.message);
        // Include host/port in error to see what it attempted
        return { success: false, message: `${error.message} (attempted smtp.gmail.com:465)` };
    }
};

module.exports = sendEmail;
