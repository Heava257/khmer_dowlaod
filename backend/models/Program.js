const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Program = sequelize.define('Program', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    category: {
        type: DataTypes.STRING,
        defaultValue: 'General',
    },
    version: {
        type: DataTypes.STRING,
    },
    downloadUrl: {
        type: DataTypes.STRING,
    },
    externalDownloadUrl: {
        type: DataTypes.STRING,
    },
    iconUrl: {
        type: DataTypes.STRING,
    },
    imageUrl: {
        type: DataTypes.STRING,
    },
    fileSize: {
        type: DataTypes.STRING,
    },
    downloads: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    },
    price: {
        type: DataTypes.DOUBLE,
        defaultValue: 0,
    },
    isPaid: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
    }
});

module.exports = Program;
