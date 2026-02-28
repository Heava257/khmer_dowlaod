const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const multer = require('multer');
const path = require('path');
const auth = require('../middleware/auth');

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/');
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});
const upload = multer({
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
router.post('/', auth, upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const { title, description, programId } = req.body;
        const videoUrl = req.files['video'] ? `/uploads/${req.files['video'][0].filename}` : '';
        const thumbnailUrl = req.files['thumbnail'] ? `/uploads/${req.files['thumbnail'][0].filename}` : '';

        const video = await Video.create({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            programId
        });
        res.status(201).json(video);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

// Update video - Protected
router.put('/:id', auth, upload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const video = await Video.findByPk(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const { title, description, programId } = req.body;
        const updates = { title, description, programId };

        if (req.files['video']) updates.videoUrl = `/uploads/${req.files['video'][0].filename}`;
        if (req.files['thumbnail']) updates.thumbnailUrl = `/uploads/${req.files['thumbnail'][0].filename}`;

        await video.update(updates);
        res.json(video);
    } catch (error) {
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
