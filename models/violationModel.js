const { db } = require('../config/db');

exports.getAll = (cb) => {
  db.query(`
    SELECT v.*, m.nama, m.nim, m.jurusan, m.semester
    FROM violations v
    JOIN mahasiswa m ON v.mahasiswa_id = m.id
  `, cb);
};

exports.getById = (id, cb) => {
  db.query(`
    SELECT v.*, m.nama, m.nim, m.jurusan, m.semester
    FROM violations v
    JOIN mahasiswa m ON v.mahasiswa_id = m.id
    WHERE v.id = ?
  `, [id], cb);
};

exports.getByNIM = (nim, cb) => {
  db.query(`
    SELECT v.*, m.nama, m.nim, m.jurusan, m.semester
    FROM violations v
    JOIN mahasiswa m ON v.mahasiswa_id = m.id
    WHERE m.nim = ?
  `, [nim], cb);
};

exports.create = (mahasiswa, pelanggaran, cb) => {
  db.query('SELECT id FROM mahasiswa WHERE nim = ?', [mahasiswa.nim], (err, result) => {
    if (err) return cb(err);

    const insertViolation = (mahasiswaId) => {
      db.query(`
        INSERT INTO violations 
        (mahasiswa_id, id_kasus, jenis_kasus, status, hasil_sidang, notulensi, foto, deskripsi, status_approval, type)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `, [
        mahasiswaId,
        pelanggaran.id_kasus,
        pelanggaran.jenis_kasus,
        pelanggaran.status,
        pelanggaran.hasil_sidang,
        pelanggaran.notulensi,
        pelanggaran.foto || null,
        pelanggaran.deskripsi || null,
        pelanggaran.status_approval || 'Pending',
        pelanggaran.type || 'New'
      ], cb);
    };

    if (result.length > 0) {
      insertViolation(result[0].id);
    } else {
      db.query(`
        INSERT INTO mahasiswa (nama, nim, jurusan, semester)
        VALUES (?, ?, ?, ?)
      `, [mahasiswa.nama, mahasiswa.nim, mahasiswa.jurusan, mahasiswa.semester], (err2, result2) => {
        if (err2) return cb(err2);
        insertViolation(result2.insertId);
      });
    }
  });
};

exports.update = (id, data, cb) => {
  const allowedFields = [
    "id_kasus", "jenis_kasus", "status", "hasil_sidang", "notulensi",
    "foto", "deskripsi", "status_approval", "type"
  ];

  const updates = [];
  const values = [];

  for (const key of allowedFields) {
    if (data[key] !== undefined) {
      updates.push(`${key} = ?`);
      values.push(data[key]);
    }
  }

  if (updates.length === 0) {
    return cb(null, { message: "Tidak ada field yang diupdate." });
  }

  values.push(id);

  const sql = `UPDATE violations SET ${updates.join(', ')} WHERE id = ?`;
  db.query(sql, values, cb);
};

exports.delete = (id, cb) => {
  db.query('DELETE FROM violations WHERE id = ?', [id], cb);
};
