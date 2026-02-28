const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
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

// Disk storage for videos
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

        let thumbnailUrl = '';
        const videoUrl = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : '';

        // Manually upload thumbnail to Cloudinary if it exists
        if (req.files['thumbnail']) {
            const thumbnailFile = req.files['thumbnail'][0];
            const result = await cloudinary.uploader.upload(thumbnailFile.path, {
                folder: 'khmer_download/thumbnails'
            });
            thumbnailUrl = result.secure_url;
            // Optionally delete the local file
            fs.unlinkSync(thumbnailFile.path);
        }

        const video = await Video.create({
            title, description, videoUrl, thumbnailUrl, programId, externalVideoUrl
        });
        res.status(201).json(video);
    } catch (error) {
        console.error('Video Creation Error:', error);
        res.status(400).json({ message: error.message });
    }
});

// Update video - Protected
router.put('/:id', auth, diskUpload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const video = await Video.findByPk(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const { title, description, programId, externalVideoUrl } = req.body;
        const updates = { title, description, programId, externalVideoUrl };

        if (req.files['video']) updates.videoUrl = `/uploads/${req.files['video'][0].filename}`;

        if (req.files['thumbnail']) {
            const result = await cloudinary.uploader.upload(req.files['thumbnail'][0].path, {
                folder: 'khmer_download/thumbnails'
            });
            updates.thumbnailUrl = result.secure_url;
            fs.unlinkSync(req.files['thumbnail'][0].path);
        }

        await video.update(updates);
        res.json(video);
    } catch (error) {
        console.error('Video Update Error:', error);
        res.status(400).json({ message: error.message });
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
破
