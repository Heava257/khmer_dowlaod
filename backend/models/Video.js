const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/db');

const Video = sequelize.define('Video', {
    title: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    description: {
        type: DataTypes.TEXT,
    },
    videoUrl: {
        type: DataTypes.STRING,
    },
    externalVideoUrl: {
        type: DataTypes.STRING,
    },
    thumbnailUrl: {
        type: DataTypes.STRING,
    },
    programId: {
        type: DataTypes.INTEGER,
        allowNull: true, // Optionally link to a program
    },
    views: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
    }
});

module.exports = Video;
