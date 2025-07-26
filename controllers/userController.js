const bcrypt = require('bcryptjs');
const User = require('../models/userModel');
const fs = require('fs');
const path = require('path');

exports.getUsers = (req, res) => {
  User.getAllUsers((err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data', error: err });
    res.json(results);
  });
};

exports.getUser = (req, res) => {
  const id = req.params.id;
  User.getUserById(id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal mengambil data', error: err });
    if (results.length === 0) return res.status(404).json({ message: 'User tidak ditemukan' });
    res.json(results[0]);
  });
};

exports.register = (req, res) => {
  const { nip, email, password, role_id, nama, no_telp, fakultas, jurusan } = req.body;
  const photo = req.file ? req.file.filename : null;

  bcrypt.hash(password, 10, (err, hashedPassword) => {
    if (err) return res.status(500).json({ error: 'Hashing error' });

    const newUser = {
      nip,
      email,
      password: hashedPassword,
      role_id,
      nama,
      no_telp: no_telp || '+62',
      fakultas: fakultas || 'Informatika',
      jurusan: jurusan || 'Rekayasa Perangkat Lunak',
      photo,
    };

    User.createUser(newUser, (err, result) => {
      if (err) return res.status(500).json({ error: err.message });
      res.status(201).json({
        message: 'User registered successfully',
        register: newUser,
      });
    });
  });
};

exports.updateUser = (req, res) => {
  const id = req.params.id;
  const { nip, nama, email, no_telp, fakultas, jurusan } = req.body;

  const userData = { nip, nama, email, no_telp, fakultas, jurusan };

  User.updateUser(id, userData, (err) => {
    if (err) return res.status(500).json({ message: 'Gagal update user', error: err });
    res.json({ message: 'User berhasil diupdate' });
  });
};

exports.updateUserPhoto = (req, res) => {
  const id = req.params.id;
  const photo = req.file ? req.file.filename : null;
  if (!photo) return res.status(400).json({ message: 'Foto tidak ditemukan.' });

  // Ambil foto lama
  User.getUserPhotoById(id, (err, results) => {
    if (err) return res.status(500).json({ message: 'Gagal ambil user', error: err });

    // Hapus foto lama jika ada
    if (results.length > 0 && results[0].photo) {
      const oldPath = path.join(__dirname, "..", "uploads", "profile", results[0].photo);
      fs.unlink(oldPath, (err) => {
        if (err) console.warn("Gagal hapus foto lama:", err.message);
      });
    }

    // Update foto baru
    User.updateUserPhoto(id, photo, (err) => {
      if (err) return res.status(500).json({ message: 'Gagal update foto', error: err });
      res.json({ message: 'Foto berhasil diperbarui', updatedPhoto: photo });
    });
  });
};

exports.addUserManagement = async (req, res) => {
  let { nip, nama, email, password, role_id, fakultas, jurusan, no_telp } = req.body;

  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    const userData = {
      nip,
      nama,
      email,
      password: hashedPassword,
      role_id,
      fakultas,
      jurusan,
      no_telp,
    };

    User.createUser(userData, (err, result) => {
      if (err) return res.status(500).json({ message: 'Gagal menambah user', error: err });

      res.status(201).json({
        message: 'User berhasil ditambahkan',
        newUser: userData,
      });
    });
  } catch (error) {
    return res.status(500).json({ message: 'Gagal hashing password', error });
  }
};

exports.updateUserManagement = async (req, res) => {
  const id = req.params.id;
  let { nip, nama, email, password, role_id, fakultas, jurusan, no_telp } = req.body;

  const userData = { nip, nama, email, role_id };

  if (fakultas) userData.fakultas = fakultas;
  if (jurusan) userData.jurusan = jurusan;
  if (no_telp) userData.no_telp = no_telp;

  if (password) {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      userData.password = hashedPassword;
    } catch (error) {
      return res.status(500).json({ message: 'Gagal mengenkripsi password', error });
    }
  }

  const fields = Object.keys(userData);
  const values = Object.values(userData);
  const setClause = fields.map(field => `${field} = ?`).join(', ');
  const query = `UPDATE users SET ${setClause} WHERE id = ?`;
  values.push(id);

  User.customQuery(query, values, (err) => {
    if (err) return res.status(500).json({ message: 'Gagal update user', error: err });
    res.json({
      message: 'User berhasil diupdate',
      updatedUser: userData,
    });
  });
};

exports.deleteUser = (req, res) => {
  const id = req.params.id;
  User.deleteUser(id, (err) => {
    if (err) return res.status(500).json({ message: 'Gagal menghapus user', error: err });
    res.json({
      message: 'User berhasil dihapus',
      deleteUser: id
    });
  });
};
