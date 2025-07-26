const multer = require('multer');
const path = require('path');
const fs = require('fs');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const profilePath = 'uploads/profile';
    fs.mkdirSync(profilePath, { recursive: true });
    cb(null, profilePath);
  },
  filename: (req, file, cb) => {
    const timestamp = Date.now();
    const ext = path.extname(file.originalname);
    cb(null, `${timestamp}${ext}`);
  }
});

const allowedImageTypes = ['image/png', 'image/jpeg', 'image/jpg'];

const fileFilter = (req, file, cb) => {
  if (allowedImageTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Format gambar tidak didukung. Hanya PNG, JPG, JPEG yang diizinkan.'), false);
  }
};

const uploadProfile = multer({ storage, fileFilter });

module.exports = uploadProfile;
