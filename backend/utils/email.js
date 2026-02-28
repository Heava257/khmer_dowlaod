const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
    try {
        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('[DEBUG] Email credentials missing. Logging to console instead.');
            return true;
        }

        console.log(`[EMAIL] Initializing transport for ${to}...`);

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // TLS
            auth: {
                user: process.env.EMAIL_USER.trim(),
                pass: process.env.EMAIL_PASS.replace(/\s/g, '')
            },
            tls: {
                // Do not fail on invalid certs
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Khmer Download" <${process.env.EMAIL_USER.trim()}>`,
            to,
            subject,
            html
        };

        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Success: ${info.messageId}`);
        return true;
    } catch (error) {
        console.error('[EMAIL ERROR]:', error.message);
        if (error.code === 'EAUTH') {
            console.error('[EMAIL ERROR] Authentication failed. Check your App Password.');
        }
        return false;
    }
};

module.exports = sendEmail;
