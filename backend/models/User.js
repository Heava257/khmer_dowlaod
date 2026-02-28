const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const User = sequelize.define('User', {
    username: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
        validate: { isEmail: true }
    },
    password: {
        type: DataTypes.STRING,
        allowNull: true, // Allow null for social/OTP-only signup if needed
    },
    role: {
        type: DataTypes.ENUM('admin', 'user'),
        defaultValue: 'user',
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    },
    otpCode: {
        type: DataTypes.STRING,
    },
    otpExpires: {
        type: DataTypes.DATE,
    }
});

module.exports = User;
