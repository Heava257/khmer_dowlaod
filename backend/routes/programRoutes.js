const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');
const cloudinaryUpload = require('../middleware/cloudinary');

// Multer Config for file uploads (Disk Storage for big files)
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const diskUpload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

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
router.post('/', auth, (req, res) => {
    // 1. Upload settings to Cloudinary for icons (small images)
    cloudinaryUpload.fields([{ name: 'icon' }])(req, res, (err) => {
        if (err) return res.status(400).json({ message: 'Icon upload failed', error: err.message });

        // 2. Upload to Disk for the program file (big files)
        diskUpload.fields([{ name: 'file' }])(req, res, async (err) => {
            if (err) return res.status(400).json({ message: 'File upload failed', error: err.message });

            try {
                const { title, description, category, version, price, isPaid, externalDownloadUrl } = req.body;

                const downloadUrl = req.files['file'] ? `/uploads/${req.files['file'][0].filename}` : '';
                const iconUrl = req.files['icon'] ? req.files['icon'][0].path : '';

                const program = await Program.create({
                    title, description, category, version, downloadUrl, iconUrl,
                    price: price || 0,
                    isPaid: isPaid === 'true' || isPaid === true,
                    externalDownloadUrl
                });
                res.status(201).json(program);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    });
});

// Update program - Protected
router.put('/:id', auth, (req, res) => {
    cloudinaryUpload.fields([{ name: 'icon' }])(req, res, (err) => {
        if (err) return res.status(400).json({ message: 'Icon update failed', error: err.message });

        diskUpload.fields([{ name: 'file' }])(req, res, async (err) => {
            if (err) return res.status(400).json({ message: 'File update failed', error: err.message });

            try {
                const program = await Program.findByPk(req.params.id);
                if (!program) return res.status(404).json({ message: 'Program not found' });

                const { title, description, category, version, price, isPaid, externalDownloadUrl } = req.body;
                const updates = {
                    title, description, category, version,
                    price: price || 0,
                    isPaid: isPaid === 'true' || isPaid === true,
                    externalDownloadUrl
                };

                if (req.files['file']) updates.downloadUrl = `/uploads/${req.files['file'][0].filename}`;
                if (req.files['icon']) updates.iconUrl = req.files['icon'][0].path;

                await program.update(updates);
                res.json(program);
            } catch (error) {
                res.status(400).json({ message: error.message });
            }
        });
    });
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
