const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
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

// Get all videos
router.get('/', async (req, res) => {
    try {
        const videos = await Video.findAll();
        res.json(videos);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create new video - Protected
router.post('/', auth, diskUpload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const { title, description, programId, externalVideoUrl } = req.body;
        console.log('--- START VIDEO UPLOAD ---');
        console.log('Body:', { title, programId, externalVideoUrl });
        console.log('Files received:', Object.keys(req.files || {}));

        let thumbnailUrl = '';
        let videoUrl = '';

        if (req.files && req.files['video']) {
            videoUrl = `/uploads/${req.files['video'][0].filename}`;
            console.log('Video file saved to:', videoUrl);
        }

        // Manually upload thumbnail to Cloudinary if it exists
        if (req.files && req.files['thumbnail']) {
            const thumbnailFile = req.files['thumbnail'][0];
            const thumbPath = path.resolve(thumbnailFile.path);
            console.log('Uploading Thumbnail to Cloudinary from:', thumbPath);

            try {
                const result = await cloudinary.uploader.upload(thumbPath, {
                    folder: 'khmer_download/thumbnails',
                    resource_type: 'image'
                });
                thumbnailUrl = result.secure_url;
                console.log('Cloudinary response:', result.secure_url);

                // Clean up local thumbnail file after successful Cloudinary upload
                if (fs.existsSync(thumbPath)) {
                    fs.unlinkSync(thumbPath);
                }
            } catch (cloudErr) {
                console.error('CLOUDINARY ERROR OBJECT:', cloudErr);
                const errorDetail = cloudErr.message || (typeof cloudErr === 'string' ? cloudErr : JSON.stringify(cloudErr));
                throw new Error('រូបភាព Thumbnail មិនអាចបង្ហោះបានទេ (Cloudinary Error): ' + errorDetail);
            }
        }

        const video = await Video.create({
            title,
            description,
            videoUrl,
            thumbnailUrl: thumbnailUrl,
            programId: programId || null,
            externalVideoUrl: externalVideoUrl || ''
        });

        console.log('Video created successfully with ID:', video.id);
        res.status(201).json(video);
    } catch (error) {
        console.error('CRITICAL VIDEO UPLOAD ERROR:', error);
        res.status(400).json({
            message: 'ការបង្ហោះវីដេអូបរាជ័យ: ' + error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Update video - Protected
router.put('/:id', auth, diskUpload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const video = await Video.findByPk(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const { title, description, programId, externalVideoUrl } = req.body;
        const updates = {
            title,
            description,
            programId: programId || null,
            externalVideoUrl: externalVideoUrl || ''
        };

        if (req.files && req.files['video']) {
            updates.videoUrl = `/uploads/${req.files['video'][0].filename}`;
        }

        if (req.files && req.files['thumbnail']) {
            const thumbnailFile = req.files['thumbnail'][0];
            const thumbPath = path.resolve(thumbnailFile.path);

            try {
                const result = await cloudinary.uploader.upload(thumbPath, {
                    folder: 'khmer_download/thumbnails',
                    resource_type: 'image'
                });
                updates.thumbnailUrl = result.secure_url;
                if (fs.existsSync(thumbPath)) {
                    fs.unlinkSync(thumbPath);
                }
            } catch (cloudErr) {
                console.error('CLOUDINARY UPDATE ERROR:', cloudErr);
                const errorDetail = cloudErr.message || (typeof cloudErr === 'string' ? cloudErr : JSON.stringify(cloudErr));
                throw new Error('រូបភាព Thumbnail មិនអាច Update បានទេ: ' + errorDetail);
            }
        }

        await video.update(updates);
        res.json(video);
    } catch (error) {
        console.error('Video Update Error:', error);
        res.status(400).json({
            message: 'ការកែសម្រួលវីដេអូបរាជ័យ: ' + error.message
        });
    }
});

// Delete video - Protected
router.post('/delete/:id', auth, async (req, res) => {
    try {
        const video = await Video.findByPk(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });
        await video.destroy();
        res.json({ message: 'Video deleted' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
