const bcrypt = require('bcryptjs');
const User = require('./models/User');
const { connectDB, sequelize } = require('./config/db');

const createAdmin = async () => {
    await connectDB();
    try {
        await sequelize.sync();
        const hashedPassword = await bcrypt.hash('admin123', 10);
        await User.create({
            username: 'admin',
            password: hashedPassword,
            role: 'admin'
        });
        console.log('Admin account created: admin / admin123');
        process.exit(0);
    } catch (error) {
        console.error('Error creating admin:', error.message);
        process.exit(1);
    }
};

createAdmin();
