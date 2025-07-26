const express = require('express');
const router = express.Router();
const upload = require('../middleware/uploadMiddleware');
const { verifyToken } = require('../middleware/authMiddleware');
const controller = require('../controllers/violationController');

router.post('/upload', verifyToken, upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'Gagal upload file' });
    }

    res.json({
        message: 'Upload sementara berhasil',
        file: {
            name: req.file.filename,
            tempPath: req.file.path,
        }
    });
});

router.get('/', verifyToken, controller.getAll);

router.post(
    '/',
    verifyToken,
    upload.fields([
        { name: 'hasil_sidang_path', maxCount: 1 },
        { name: 'notulensi_path', maxCount: 1 },
        { name: 'photo_path', maxCount: 1 }
    ]),
    controller.createWithUpload
);

router.get('/:id', verifyToken, controller.getById);
router.get('/student/:nim', verifyToken, controller.getByNIM);

router.put(
    '/:id',
    verifyToken,
    upload.fields([
        { name: 'hasil_sidang_path', maxCount: 1 },
        { name: 'notulensi_path', maxCount: 1 },
        { name: 'photo_path', maxCount: 1 }
    ]),
    controller.update
);

router.put('/:id/status', verifyToken, controller.updateStatusApproval);

router.delete('/:id', verifyToken, controller.delete);

router.post('/export', verifyToken, controller.exportReport);

module.exports = router;
