const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '500mb' }));
app.use(express.urlencoded({ extended: true, limit: '500mb' }));
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Models & Routes
const User = require('./models/User');
const Program = require('./models/Program');
const Video = require('./models/Video');
const Transaction = require('./models/Transaction');
const Feedback = require('./models/Feedback');

const programRoutes = require('./routes/programRoutes');
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const feedbackRoutes = require('./routes/feedbackRoutes');

// Routes
app.get('/', (req, res) => {
    res.send('Khmer Download API is running...');
});

app.use('/api/programs', programRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/transactions', transactionRoutes);
app.use('/api/feedbacks', feedbackRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Sync Database & Start Server
const startServer = async () => {
    await connectDB();
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced.');

        // Auto-seed Admin
        const bcrypt = require('bcryptjs');
        const adminEmail = 'admin@khmerdownload.com';
        const adminExists = await User.findOne({ where: { role: 'admin' } });

        if (!adminExists) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await User.create({
                username: 'admin',
                email: adminEmail,
                password: hashedPassword,
                role: 'admin',
                isVerified: true
            });
            console.log('Default admin created (admin@khmerdownload.com / admin123)');
        }
    } catch (error) {
        console.error('Failed during startup:', error);
    }

    app.listen(PORT, '0.0.0.0', () => {
        console.log(`Server running on port ${PORT}`);
    });
};

startServer();
