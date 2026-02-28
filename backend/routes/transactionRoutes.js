const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const auth = require('../middleware/auth');

// Create new transaction when a payment QR is generated
router.post('/init', async (req, res) => {
    try {
        const { billNumber, amount, programId, md5, userId } = req.body;
        console.log(`Payment Initialized: Bill #${billNumber} for User ID ${userId || 'GUEST'}`);

        const transaction = await Transaction.create({
            billNumber,
            amount,
            programId,
            userId: userId || null,
            md5,
            status: 'PENDING'
        });
        res.status(201).json(transaction);
    } catch (error) {
        console.error('TRANSACTION INIT ERROR:', error.message);
        res.status(400).json({ message: error.message });
    }
});

// Update status (this would be called by your Bakong Webhook in production)
router.patch('/update-status/:billNumber', async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findOne({ where: { billNumber: req.params.billNumber } });
        if (!transaction) return res.status(404).json({ message: 'Transaction not found' });

        transaction.status = status;
        await transaction.save();
        console.log(`Payment Status Updated: Bill #${req.params.billNumber} is now ${status}`);
        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Admin: View all transactions
router.get('/', auth, async (req, res) => {
    try {
        if (req.user.role !== 'admin') return res.status(403).json({ message: 'Forbidden' });
        const transactions = await Transaction.findAll({ order: [['createdAt', 'DESC']] });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
