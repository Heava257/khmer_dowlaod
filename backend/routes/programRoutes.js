const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { cloudinary } = require('../middleware/cloudinary');

// Ensure uploads directory exists
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Disk storage for large program files
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
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

// Create new program - Protected
router.post('/', auth, diskUpload.fields([{ name: 'file' }, { name: 'icon' }]), async (req, res) => {
    try {
        const { title, description, category, version, price, isPaid, externalDownloadUrl } = req.body;

        let iconUrl = '';
        const downloadUrl = req.files['file'] ? `/uploads/${req.files['file'][0].filename}` : '';

        // Manually upload icon to Cloudinary if it exists
        if (req.files['icon']) {
            const iconFile = req.files['icon'][0];
            const result = await cloudinary.uploader.upload(iconFile.path, {
                folder: 'khmer_download/icons'
            });
            iconUrl = result.secure_url;
            // Optionally delete the local file
            fs.unlinkSync(iconFile.path);
        }

        const program = await Program.create({
            title, description, category, version, downloadUrl, iconUrl,
            price: price || 0,
            isPaid: isPaid === 'true' || isPaid === true,
            externalDownloadUrl
        });
        res.status(201).json(program);
    } catch (error) {
        console.error('Program Creation Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update program - Protected
router.put('/:id', auth, diskUpload.fields([{ name: 'file' }, { name: 'icon' }]), async (req, res) => {
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

        if (req.files['file']) {
            updates.downloadUrl = `/uploads/${req.files['file'][0].filename}`;
        }

        if (req.files['icon']) {
            const result = await cloudinary.uploader.upload(req.files['icon'][0].path, {
                folder: 'khmer_download/icons'
            });
            updates.iconUrl = result.secure_url;
            fs.unlinkSync(req.files['icon'][0].path);
        }

        await program.update(updates);
        res.json(program);
    } catch (error) {
        console.error('Program Update Error:', error);
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
