const express = require('express');
const router = express.Router();
const Feedback = require('../models/Feedback');
const { verifyToken } = require('./authRoutes');

// User submit feedback
router.post('/', async (req, res) => {
    try {
        const { name, contact, message } = req.body;
        const feedback = await Feedback.create({ name, contact, message });
        res.status(201).json(feedback);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin view feedbacks
router.get('/', verifyToken, async (req, res) => {
    try {
        const feedbacks = await Feedback.findAll({ order: [['createdAt', 'DESC']] });
        res.json(feedbacks);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin update status
router.put('/:id', verifyToken, async (req, res) => {
    try {
        const { status } = req.body;
        await Feedback.update({ status }, { where: { id: req.params.id } });
        res.json({ message: 'Status updated' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Admin delete feedback
router.delete('/:id', verifyToken, async (req, res) => {
    try {
        await Feedback.destroy({ where: { id: req.params.id } });
        res.json({ message: 'Feedback deleted' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
