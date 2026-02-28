const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const auth = require('../middleware/auth');
const { cloudinary } = require('../middleware/cloudinary');

const uploadDir = path.resolve(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname))
});

const diskUpload = multer({ storage, limits: { fileSize: 500 * 1024 * 1024 } });

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

router.get('/', async (req, res) => {
    try {
        res.json(await Video.findAll());
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

router.post('/', auth, diskUpload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const { title, description, programId, externalVideoUrl } = req.body;
        let thumbnailUrl = '';
        let videoUrl = '';

        if (req.files && req.files['video']) videoUrl = `/uploads/${req.files['video'][0].filename}`;
        if (req.files && req.files['thumbnail']) thumbnailUrl = await uploadToCloudinary(req.files['thumbnail'][0].path, 'thumbnails');

        const video = await Video.create({
            title,
            description,
            videoUrl,
            thumbnailUrl,
            programId: programId || null,
            externalVideoUrl: externalVideoUrl || ''
        });

        res.status(201).json(video);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.put('/:id', auth, diskUpload.fields([{ name: 'video' }, { name: 'thumbnail' }]), async (req, res) => {
    try {
        const video = await Video.findByPk(req.params.id);
        if (!video) return res.status(404).json({ message: 'Video not found' });

        const { title, description, programId, externalVideoUrl } = req.body;
        const updates = { title, description, programId: programId || null, externalVideoUrl: externalVideoUrl || '' };

        if (req.files && req.files['video']) updates.videoUrl = `/uploads/${req.files['video'][0].filename}`;
        if (req.files && req.files['thumbnail']) updates.thumbnailUrl = await uploadToCloudinary(req.files['thumbnail'][0].path, 'thumbnails');

        await video.update(updates);
        res.json(video);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
});

router.delete('/:id', auth, async (req, res) => {
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
