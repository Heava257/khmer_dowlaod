const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Transaction = sequelize.define('Transaction', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    billNumber: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    amount: {
        type: DataTypes.DOUBLE,
        allowNull: false,
    },
    currency: {
        type: DataTypes.STRING,
        defaultValue: 'USD',
    },
    status: {
        type: DataTypes.ENUM('PENDING', 'SUCCESS', 'FAILED'),
        defaultValue: 'PENDING',
    },
    programId: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Allow for guest-like initial recording
    },
    customerName: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    md5: {
        type: DataTypes.STRING,
        allowNull: true,
    }
}, {
    timestamps: true,
});

module.exports = Transaction;
