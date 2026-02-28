const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
    try {
        const emailUser = process.env.EMAIL_USER?.trim();
        const emailPass = process.env.EMAIL_PASS?.replace(/\s/g, '');

        if (!emailUser || !emailPass) {
            console.log('[EMAIL] ERROR: Missing EMAIL_USER or EMAIL_PASS');
            return { success: false, message: 'Missing credentials' };
        }

        console.log(`[EMAIL] Transport for ${to} using ${emailUser.substring(0, 2)}...`);

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: emailUser,
                pass: emailPass
            }
        });

        const mailOptions = {
            from: `"Khmer Download" <${emailUser}>`,
            to,
            subject,
            html
        };

        const result = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL] Sent! ID: ${result.messageId}`);
        return { success: true };
    } catch (error) {
        console.error('[EMAIL FAIL]:', error.message);
        return { success: false, message: error.message };
    }
};

module.exports = sendEmail;
