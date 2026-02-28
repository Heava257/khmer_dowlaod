const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/email');

// 1. Admin Login (Username/Password)
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 2. User Sign Up/In with Gmail OTP
router.post('/request-otp', async (req, res) => {
    try {
        const { email, username } = req.body;
        if (!email) return res.status(400).json({ message: 'Email is required' });

        const otpCode = Math.floor(100000 + Math.random() * 900000).toString();
        const otpExpires = new Date(Date.now() + 10 * 60000); // 10 minutes

        let user = await User.findOne({ where: { email } });
        if (!user) {
            // New User Registration
            user = await User.create({
                username: username || email.split('@')[0],
                email,
                role: 'user',
                isVerified: false
            });
        }

        await user.update({ otpCode, otpExpires });

        // Try to send email
        const emailSent = await sendEmail(
            email,
            'Your Verification Code - Khmer Download',
            `<h3>Verification Code</h3><p>Your code is: <b>${otpCode}</b></p><p>Expires in 10 minutes.</p>`
        );

        res.json({ message: 'OTP sent to your email', email });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// 3. User Verify OTP (Sign in / Complete registration)
router.post('/verify-otp', async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({ where: { email, otpCode: code } });

        if (!user || user.otpExpires < new Date()) {
            return res.status(400).json({ message: 'Invalid or expired code' });
        }

        // Clear OTP and verify
        await user.update({ otpCode: null, otpExpires: null, isVerified: true });

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role, email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30d' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
