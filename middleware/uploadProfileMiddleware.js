const multer = require('multer');
const fs = require('fs');
const path = require('path');

// Middleware multer dinamis berdasarkan ?type
function dynamicUpload(req, res, next) {
  const type = req.query.type || 'default';
  const folder = path.join('uploads', 'temp');

  fs.mkdirSync(folder, { recursive: true });

  const storage = multer.diskStorage({
    destination: folder,
    filename: (req, file, cb) => {
      const timestamp = Date.now();
      const ext = path.extname(file.originalname);
      cb(null, `${type}_${timestamp}${ext}`);
    }
  });

  const upload = multer({ storage });
  const singleUpload = upload.single('file');
  singleUpload(req, res, function (err) {
    if (err instanceof multer.MulterError || err) {
      return res.status(400).json({ error: 'Upload gagal', detail: err.message });
    }
    next();
  });
}
