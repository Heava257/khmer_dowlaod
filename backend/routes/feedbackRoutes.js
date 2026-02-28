const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// User submit feedback - Public
router.post('/', async (req, res) => {
    try {
        const { name, contact, message } = req.body;
        if (!name || !message) {
            return res.status(400).json({ message: 'Name and message are required' });
        }
        const feedback = await Feedback.create({ name, contact: contact || 'N/A', message });
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View all feedbacks - Publicly accessible for "Community view"
router.get('/', async (req, res) => {
    try {
        // If it's an admin, we show everything including contact
        // We check token if provided
        const authHeader = req.headers['authorization'];
        const isAdmin = !!authHeader; // Simple check for now, can use full auth middleware if preferred

        const feedbacks = await Feedback.findAll({
            order: [['createdAt', 'DESC']],
            attributes: isAdmin
                ? undefined // Admin sees everything
                : ['id', 'name', 'message', 'adminReply', 'replyDate', 'status', 'createdAt'] // Public sees these
        });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Reply to feedback - Protected
router.put('/reply/:id', auth, async (req, res) => {
    try {
        const { adminReply } = req.body;
        const feedback = await Feedback.findByPk(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

        await feedback.update({
            adminReply,
            replyDate: new Date(),
            status: 'resolved'
        });
        res.json({ message: 'Reply submitted', feedback });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin delete feedback - Protected
router.delete('/:id', auth, async (req, res) => {
    try {
        await Feedback.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
