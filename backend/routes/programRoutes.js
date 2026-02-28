const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

// Multer Config for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({ storage });

// Get all programs
router.get('/', async (req, res) => {
    try {
        const programs = await Program.findAll();
        res.json(programs);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new program (with upload) - Protected
router.post('/', auth, upload.fields([{ name: 'file' }, { name: 'icon' }]), async (req, res) => {
    try {
        const { title, description, category, version, price, isPaid } = req.body;
        const downloadUrl = req.files['file'] ? `/uploads/${req.files['file'][0].filename}` : '';
        const iconUrl = req.files['icon'] ? `/uploads/${req.files['icon'][0].filename}` : '';

        const program = await Program.create({
            title,
            description,
            category,
            version,
            downloadUrl,
            iconUrl,
            price: price || 0,
            isPaid: isPaid === 'true' || isPaid === true
        });
        res.status(201).json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update program - Protected
router.put('/:id', auth, upload.fields([{ name: 'file' }, { name: 'icon' }]), async (req, res) => {
    try {
        const program = await Program.findByPk(req.params.id);
        if (!program) return res.status(404).json({ message: 'Program not found' });

        const { title, description, category, version, price, isPaid } = req.body;
        const updates = {
            title,
            description,
            category,
            version,
            price: price || 0,
            isPaid: isPaid === 'true' || isPaid === true
        };

        if (req.files['file']) updates.downloadUrl = `/uploads/${req.files['file'][0].filename}`;
        if (req.files['icon']) updates.iconUrl = `/uploads/${req.files['icon'][0].filename}`;

        await program.update(updates);
        res.json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete program - Protected
router.post('/delete/:id', auth, async (req, res) => {
    try {
        const program = await Program.findByPk(req.params.id);
        if (!program) return res.status(404).json({ message: 'Program not found' });
        await program.destroy();
        res.json({ message: 'Program deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
