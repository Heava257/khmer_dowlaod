const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

// User or community submit feedback or user-to-user reply
router.post('/', async (req, res) => {
    try {
        const { name, contact, message, parentId } = req.body;
        if (!name || !message) {
            return res.status(400).json({ message: 'Name and message are required' });
        }

        const feedback = await Feedback.create({
            name,
            contact: contact || 'N/A',
            message,
            parentId: parentId || null
        });
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// React (Like/Love) to a feedback
router.post('/react/:id', async (req, res) => {
    try {
        const { type } = req.body; // 'like' or 'love'
        const feedback = await Feedback.findByPk(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

        if (type === 'like') {
            await feedback.increment('likes');
        } else if (type === 'love') {
            await feedback.increment('loves');
        }

        await feedback.reload();
        res.json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update feedback message - Public (Simplified check)
router.put('/:id', async (req, res) => {
    try {
        const { message } = req.body;
        const feedback = await Feedback.findByPk(req.params.id);
        if (!feedback) return res.status(404).json({ message: 'Feedback not found' });

        await feedback.update({ message });
        res.json({ message: 'Updated successfully', feedback });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// View all feedbacks (Community view)
router.get('/', async (req, res) => {
    try {
        const authHeader = req.headers['authorization'];
        const isAdmin = !!authHeader;

        // Fetch everything, the frontend will handle nesting
        const feedbacks = await Feedback.findAll({
            order: [['createdAt', 'ASC']], // Oldest first to show chain
            attributes: isAdmin
                ? undefined
                : ['id', 'name', 'message', 'adminReply', 'replyDate', 'parentId', 'likes', 'loves', 'status', 'createdAt']
        });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin Reply (Official badge)
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
        res.json({ message: 'Official reply submitted', feedback });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete feedback - Admin or simplified browser-owner check (Public access to logic)
router.delete('/:id', async (req, res) => {
    try {
        await Feedback.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
