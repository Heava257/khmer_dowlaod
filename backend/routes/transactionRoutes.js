const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');

// Create new transaction when a payment QR is generated
router.post('/init', async (req, res) => {
    try {
        const { billNumber, amount, programId, md5 } = req.body;
        const transaction = await Transaction.create({
            billNumber,
            amount,
            programId,
            md5,
            status: 'PENDING'
        });
        res.status(201).json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update status (this would be called by your Bakong Webhook in production)
router.patch('/update-status/:billNumber', async (req, res) => {
    try {
        const { status } = req.body;
        const transaction = await Transaction.findOne({ where: { billNumber: req.params.billNumber } });
        if (!transaction) return res.status(404).json({ message: 'Not found' });

        transaction.status = status;
        await transaction.save();
        res.json(transaction);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

module.exports = router;
