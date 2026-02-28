const nodemailer = require('nodemailer');
require('dotenv').config();

const sendEmail = async (to, subject, html) => {
    try {
        // You'll need to set these in Railway Variables for real Gmail
        // Example: EMAIL_USER=yourgmail@gmail.com, EMAIL_PASS=yourapppassword
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER?.trim(),
                pass: process.env.EMAIL_PASS?.replace(/\s/g, '') // Remove all horizontal spaces
            }
        });

        const mailOptions = {
            from: `"Khmer Download" <${process.env.EMAIL_USER}>`,
            to,
            subject,
            html
        };

        if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
            console.log('\n--- EMAIL LOG (Development Only) ---');
            console.log(`To: ${to}`);
            console.log(`Subject: ${subject}`);
            console.log(`Content: ${html}`);
            console.log('-------------------------------------\n');
            return true;
        }

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error('SEND MAIL ERROR:', error);
        return false;
    }
};

module.exports = sendEmail;
