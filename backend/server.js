const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB, sequelize } = require('./config/db');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.send('Khmer Download API is running...');
});

// Import Routes
const programRoutes = require('./routes/programRoutes');
const videoRoutes = require('./routes/videoRoutes');
const authRoutes = require('./routes/authRoutes');
const transactionRoutes = require('./routes/transactionRoutes');
const Transaction = require('./models/Transaction');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User');

app.use('/api/programs', programRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/transactions', transactionRoutes);

// Main Login Route (moved from authRoutes for debugging)
app.post('/api/auth/login', async (req, res) => {
    try {
        console.log('Login attempt for:', req.body.username);
        const { username, password } = req.body;
        const user = await User.findOne({ where: { username } });

        if (!user) {
            console.log('User not found');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            console.log('Password mismatch');
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { id: user.id, username: user.username, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({ token, user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
        console.error('LOGIN ERROR:', error.message);
        res.status(500).json({ message: error.message });
    }
});

// Using other auth routes (if any)
app.use('/api/auth', authRoutes);

// Error Handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err.message);
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error', error: err.message });
});

// Sync Database & Start Server
const startServer = async () => {
    await connectDB();
    try {
        await sequelize.sync({ alter: true });
        console.log('Database synced.');
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to sync database:', error);
    }
};

startServer();
