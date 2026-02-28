const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { cloudinary } = require('../middleware/cloudinary');

// Use absolute path for uploads to ensure consistency across environments
const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Disk storage for temporary processing before Cloudinary upload
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname));
    }
});

const diskUpload = multer({
    storage,
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit
});

// Helper for Cloudinary Upload
const uploadToCloudinary = async (tempPath, folder) => {
    try {
        const result = await cloudinary.uploader.upload(tempPath, {
            folder: `khmer_download/${folder}`,
            resource_type: 'image'
        });
        if (fs.existsSync(tempPath)) fs.unlinkSync(tempPath);
        return result.secure_url;
    } catch (err) {
        console.error(`Cloudinary Error (${folder}):`, err);
        throw err;
    }
};

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
router.post('/', auth, diskUpload.fields([
    { name: 'file' },
    { name: 'icon' },
    { name: 'banner' }
]), async (req, res) => {
    try {
        const { title, description, category, version, price, isPaid, externalDownloadUrl } = req.body;
        let iconUrl = '';
        let imageUrl = '';
        let downloadUrl = '';

        if (req.files && req.files['file']) {
            downloadUrl = `/uploads/${req.files['file'][0].filename}`;
        }

        if (req.files && req.files['icon']) {
            iconUrl = await uploadToCloudinary(req.files['icon'][0].path, 'icons');
        }

        if (req.files && req.files['banner']) {
            imageUrl = await uploadToCloudinary(req.files['banner'][0].path, 'banners');
        }

        const program = await Program.create({
            title,
            description,
            category: category || 'Programs',
            version: version || '1.0',
            downloadUrl,
            iconUrl,
            imageUrl,
            price: parseFloat(price) || 0,
            isPaid: String(isPaid) === 'true',
            externalDownloadUrl: externalDownloadUrl || ''
        });

        res.status(201).json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update program - Protected
router.put('/:id', auth, diskUpload.fields([
    { name: 'file' },
    { name: 'icon' },
    { name: 'banner' }
]), async (req, res) => {
    try {
        const program = await Program.findByPk(req.params.id);
        if (!program) return res.status(404).json({ message: 'Program not found' });

        const { title, description, category, version, price, isPaid, externalDownloadUrl } = req.body;
        const updates = {
            title,
            description,
            category,
            version,
            price: parseFloat(price) || 0,
            isPaid: String(isPaid) === 'true',
            externalDownloadUrl: externalDownloadUrl || ''
        };

        if (req.files && req.files['file']) {
            updates.downloadUrl = `/uploads/${req.files['file'][0].filename}`;
        }

        if (req.files && req.files['icon']) {
            updates.iconUrl = await uploadToCloudinary(req.files['icon'][0].path, 'icons');
        }

        if (req.files && req.files['banner']) {
            updates.imageUrl = await uploadToCloudinary(req.files['banner'][0].path, 'banners');
        }

        await program.update(updates);
        res.json(program);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Delete program - Protected (Changed to DELETE for standard)
router.delete('/:id', auth, async (req, res) => {
    try {
        const program = await Program.findByPk(req.params.id);
        if (!program) return res.status(404).json({ message: "Program not found" });
        await program.destroy();
        res.json({ message: 'Program deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
