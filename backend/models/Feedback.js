const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Feedback = sequelize.define('Feedback', {
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    contact: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: false,
    },
    adminReply: {
        type: DataTypes.TEXT,
    },
    replyDate: {
        type: DataTypes.DATE,
    },
    parentId: {
        type: DataTypes.INTEGER,
        allowNull: true, // If null, it's a main post. If set, it's a reply.
    },
    likes: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    loves: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    status: {
        type: DataTypes.ENUM('pending', 'resolved'),
        defaultValue: 'pending',
    }
});

module.exports = Feedback;
