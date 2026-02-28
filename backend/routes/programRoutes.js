const express = require('express');
const router = express.Router();
const Program = require('../models/Program');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { cloudinary } = require('../middleware/cloudinary');

// Use absolute path for uploads to ensure consistency across environments
const uploadDir = path.join(__dirname, '..', 'uploads');
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
    limits: { fileSize: 500 * 1024 * 1024 } // 500MB limit for programs
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

        // Basic log to debug fields
        console.log('Creating program:', { title, isPaid, price });

        let iconUrl = '';
        let downloadUrl = '';

        if (req.files && req.files['file']) {
            downloadUrl = `/uploads/${req.files['file'][0].filename}`;
        }

        // Manually upload icon to Cloudinary if it exists
        if (req.files && req.files['icon']) {
            const iconFile = req.files['icon'][0];
            const iconPath = path.resolve(iconFile.path); // Use absolute path

            try {
                const result = await cloudinary.uploader.upload(iconPath, {
                    folder: 'khmer_download/icons',
                    resource_type: 'image'
                });
                iconUrl = result.secure_url;

                // Clean up local icon file after successful Cloudinary upload
                if (fs.existsSync(iconPath)) {
                    fs.unlinkSync(iconPath);
                }
            } catch (cloudErr) {
                console.error('Cloudinary Upload Error:', cloudErr);
                // If cloudinary fails, we might still want to proceed or fail. 
                // Let's fail for now to ensure consistency.
                throw new Error('រូបភាព Icon មិនអាចបង្ហោះបានទេ: ' + cloudErr.message);
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

        res.status(201).json(program);
    } catch (error) {
        console.error('Program Creation Error:', error);
        res.status(400).json({
            message: 'ការបង្ហោះបរាជ័យ (Failed): ' + error.message,
            detail: error.stack
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
                console.error('Cloudinary Update Error:', cloudErr);
                throw new Error('រូបភាព Icon មិនអាច Update បានទេ: ' + cloudErr.message);
            }
        }

        await program.update(updates);
        res.json(program);
    } catch (error) {
        console.error('Program Update Error:', error);
        res.status(400).json({
            message: 'ការកែសម្រួលបរាជ័យ (Failed): ' + error.message,
            detail: error.stack
        });
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
