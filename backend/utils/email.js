const { Resend } = require('resend');
require('dotenv').config();

const resend = new Resend(process.env.RESEND_API_KEY || process.env.EMAIL_PASS);

const sendEmail = async (to, subject, html) => {
    try {
        const apiKey = process.env.RESEND_API_KEY || process.env.EMAIL_PASS;
        if (!apiKey || !apiKey.startsWith('re_')) {
            console.error('[EMAIL] ERROR: Valid Resend API Key (re_...) is missing.');
            return { success: false, message: 'Invalid or missing Resend API Key' };
        }

        console.log(`[EMAIL] Sending via Resend API to: ${to}`);

        const { data, error } = await resend.emails.send({
            from: 'Khmer Download <onboarding@resend.dev>', // You can use this for test
            to,
            subject,
            html
        });

        if (error) {
            console.error('[RESEND ERROR]:', error.message);
            return { success: false, message: error.message };
        }

        console.log(`[EMAIL] Sent successfully! ID: ${data.id}`);
        return { success: true };
    } catch (error) {
        console.error('[EMAIL FAIL]:', error.message);
        return { success: false, message: error.message };
    }
};

module.exports = sendEmail;
