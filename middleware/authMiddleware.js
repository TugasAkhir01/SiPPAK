const jwt = require('jsonwebtoken');
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const SECRET_KEY = process.env.SECRET_KEY;

if (!SECRET_KEY) {
  console.warn('⚠️ SECRET_KEY tidak tersedia! Periksa .env atau Railway Variables.');
}

exports.verifyToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(403).json({ message: 'Token diperlukan dalam format Bearer <token>' });
    }

    const token = authHeader.split(' ')[1];

    jwt.verify(token, SECRET_KEY, (err, decoded) => {
        if (err) return res.status(401).json({ message: 'Token tidak valid' });
        req.user = decoded;
        next();
    });
};
