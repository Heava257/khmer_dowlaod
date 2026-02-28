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
        console.log('--- START PROGRAM UPLOAD ---');
        console.log('Body:', { title, category, price, isPaid });
        console.log('Files received:', Object.keys(req.files || {}));

        let iconUrl = '';
        let downloadUrl = '';

        if (req.files && req.files['file']) {
            downloadUrl = `/uploads/${req.files['file'][0].filename}`;
            console.log('Program file saved to:', downloadUrl);
        }

        // Manually upload icon to Cloudinary if it exists
        if (req.files && req.files['icon']) {
            const iconFile = req.files['icon'][0];
            const iconPath = path.resolve(iconFile.path);
            console.log('Uploading Icon to Cloudinary from:', iconPath);

            try {
                const result = await cloudinary.uploader.upload(iconPath, {
                    folder: 'khmer_download/icons',
                    resource_type: 'image'
                });
                iconUrl = result.secure_url;
                console.log('Cloudinary response:', result.secure_url);

                // Clean up local icon file after successful Cloudinary upload
                if (fs.existsSync(iconPath)) {
                    fs.unlinkSync(iconPath);
                }
            } catch (cloudErr) {
                console.error('CLOUDINARY ERROR OBJECT:', cloudErr);
                const errorDetail = cloudErr.message || (typeof cloudErr === 'string' ? cloudErr : JSON.stringify(cloudErr));
                throw new Error('រូបភាព Icon មិនអាចបង្ហោះបានទេ (Cloudinary Error): ' + errorDetail);
            }
        }

        const program = await Program.create({
            title,
            description,
            category: category || 'Programs',
            version: version || '1.0',
            downloadUrl,
            iconUrl,
            price: parseFloat(price) || 0,
            isPaid: String(isPaid) === 'true',
            externalDownloadUrl: externalDownloadUrl || ''
        });

        console.log('Program created successfully with ID:', program.id);
        res.status(201).json(program);
    } catch (error) {
        console.error('CRITICAL UPLOAD ERROR:', error);
        res.status(400).json({
            message: 'ការបង្ហោះបរាជ័យ: ' + error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update program - Protected
router.put('/:id', auth, diskUpload.fields([{ name: 'file' }, { name: 'icon' }]), async (req, res) => {
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
            const iconFile = req.files['icon'][0];
            const iconPath = path.resolve(iconFile.path);

            try {
                const result = await cloudinary.uploader.upload(iconPath, {
                    folder: 'khmer_download/icons',
                    resource_type: 'image'
                });
                updates.iconUrl = result.secure_url;
                if (fs.existsSync(iconPath)) {
                    fs.unlinkSync(iconPath);
                }
            } catch (cloudErr) {
                console.error('CLOUDINARY UPDATE ERROR:', cloudErr);
                const errorDetail = cloudErr.message || (typeof cloudErr === 'string' ? cloudErr : JSON.stringify(cloudErr));
                throw new Error('រូបភាព Icon មិនអាច Update បានទេ: ' + errorDetail);
            }
        }

        await program.update(updates);
        res.json(program);
    } catch (error) {
        console.error('Program Update Error:', error);
        res.status(400).json({
            message: 'ការកែសម្រួលបរាជ័យ: ' + error.message
        });
    }
});

// Delete program - Protected
router.post('/delete/:id', auth, async (req, res) => {
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
