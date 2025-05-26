const db = require('../config/db');

exports.getUserByEmail = (email, callback) => {
  const query = `
    SELECT users.*, roles.name AS role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.email = ?
  `;
  db.query(query, [email], callback);
};

exports.createUser = (data, callback) => {
  const query = `
    INSERT INTO users (nip, email, password, role_id, nama, no_telp, fakultas, jurusan, photo)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;
  const values = [
    data.nip,
    data.email,
    data.password,
    data.role_id,
    data.nama,
    data.no_telp,
    data.fakultas,
    data.jurusan,
    data.photo,
  ];
  db.query(query, values, callback);
};

exports.getAllUsers = (callback) => {
    db.query('SELECT id, nip, nama, email, role_id, password, photo FROM users', callback);
};

exports.getUserById = (id, callback) => {
    db.query('SELECT id, nip, nama, email, role_id, password, photo FROM users WHERE id = ?', [id], callback);
};

exports.updateUser = (id, data, callback) => {
    const query = `UPDATE users SET nip = ?, nama = ?, email = ?, role_id = ?, photo = ? WHERE id = ?`;
    db.query(query, [data.nip, data.nama, data.email, data.role, data.photo, id], callback);
};

exports.updateUserWithoutPhoto = (id, data, callback) => {
    const query = `UPDATE users SET nip = ?, nama = ?, email = ?, role_id = ? password = ? WHERE id = ?`;
    db.query(query, [data.nip, data.nama, data.email, data.role, data.password, id], callback);
};

exports.deleteUser = (id, callback) => {
    db.query('DELETE FROM users WHERE id = ?', [id], callback);
};

exports.customQuery = (query, values, callback) => {
    db.query(query, values, callback);
};