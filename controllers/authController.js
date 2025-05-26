const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/authModel');
require('dotenv').config();

exports.login = (req, res) => {
    const { identifier, password } = req.body;
    const identifierStr = String(identifier);
    console.log('With parameters:', [identifierStr, password]);

    User.findByIdentifier(identifierStr, async (err, results) => {
        if (err) return res.status(500).json({ message: 'Database error', error: err });
        if (results.length === 0) return res.status(404).json({ message: 'User not found' });

        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) return res.status(401).json({ message: 'Invalid credentials' });

        const token = jwt.sign({
            id: user.id,
            email: user.email,
            role: user.role
        }, process.env.SECRET_KEY, { expiresIn: '5h' });

        res.status(200).json({
            message: 'Login berhasil',
            token,
            user: {
                id: user.id,
                nim: user.nim,
                nip: user.nip,
                nama: user.nama,
                email: user.email,
                role: user.role_id
            }
        });
    });
};

exports.logout = (req, res) => {
    res.status(200).json({ message: 'Logout berhasil' });
};

exports.getMe = (req, res) => {
    const user = req.user;
    if (!user) return res.status(401).json({ message: 'Unauthorized' });

    res.status(200).json({
        message: 'Informasi pengguna berhasil didapatkan',
        user
    });
};

