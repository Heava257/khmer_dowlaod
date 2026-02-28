const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('\n--- EMAIL LOG (Development Only) ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log('-------------------------------------\n');
            return true;
        }

        console.log(`[EMAIL] Attempting to send to ${to}...`);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, // use SSL
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: process.env.EMAIL_PASS.replace(/\s/g, '')
            },
            // Reduce timeout to avoid hanging the UI too long
            connectionTimeout: 10000,
            greetingTimeout: 10000,
            socketTimeout: 10000
        });

        const mailOptions = {
            from: `"Khmer Download" <${process.env.EMAIL_USER.trim()}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Sent successfully! MessageId: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR]:', error.message);
        return false;
    }
};

module.exports = sendEmail;
