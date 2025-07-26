const { db } = require('../config/db');

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
    data.no_telp || '',
    data.fakultas || '',
    data.jurusan || '',
    data.photo || null,
  ];
  db.query(query, values, callback);
};

exports.getAllUsers = (callback) => {
  const query = `
    SELECT users.id, users.nip, users.nama, users.email,
           users.photo, roles.name AS role
    FROM users
    JOIN roles ON users.role_id = roles.id
  `;
  db.query(query, callback);
};

exports.getUserById = (id, callback) => {
  const query = `
    SELECT users.*, roles.name AS role
    FROM users
    JOIN roles ON users.role_id = roles.id
    WHERE users.id = ?
  `;
  db.query(query, [id], callback);
};

exports.updateUser = (id, data, callback) => {
  const query = `
    UPDATE users SET 
      nip = ?, nama = ?, email = ?, no_telp = ?, fakultas = ?, jurusan = ?
    WHERE id = ?
  `;
  const values = [
    data.nip,
    data.nama,
    data.email,
    data.no_telp || '',
    data.fakultas || '',
    data.jurusan || '',
    id
  ];
  db.query(query, values, callback);
};

exports.updateUserPhoto = (id, photo, callback) => {
  const query = `UPDATE users SET photo = ? WHERE id = ?`;
  db.query(query, [photo, id], callback);
};

exports.deleteUser = (id, callback) => {
  db.query('DELETE FROM users WHERE id = ?', [id], callback);
};

exports.customQuery = (query, values, callback) => {
  db.query(query, values, callback);
};

exports.getUserPhotoById = (id, callback) => {
  const query = `SELECT photo FROM users WHERE id = ?`;
  db.query(query, [id], callback);
};
