const db = require('../config/db');

exports.getAll = cb => {
    db.query(`
        SELECT v.*, m.nama, m.nim, m.jurusan
        FROM violations v JOIN mahasiswa m ON v.mahasiswa_id = m.id
    `, cb);
};

exports.getById = (id, cb) => {
    db.query(`
        SELECT v.*, m.nama, m.nim, m.jurusan
        FROM violations v
        JOIN mahasiswa m ON v.mahasiswa_id = m.id
        WHERE v.id = ?
    `, [id], cb);
};

exports.getByNIM = (nim, cb) => {
    db.query(`
        SELECT v.*, m.nama, m.nim, m.jurusan
        FROM violations v
        JOIN mahasiswa m ON v.mahasiswa_id = m.id
        WHERE m.nim = ?
    `, [nim], cb);
};

exports.create = async (mahasiswa, pelanggaran) => {
    const [existing] = await db.promise().query(
        'SELECT id FROM mahasiswa WHERE nim = ?',
        [mahasiswa.nim]
    );

    let mahasiswaId;

    if (existing.length > 0) {
        mahasiswaId = existing[0].id;
    } else {
        const [result] = await db.promise().query(
            'INSERT INTO mahasiswa (nama, nim, jurusan) VALUES (?, ?, ?)',
            [mahasiswa.nama, mahasiswa.nim, mahasiswa.jurusan]
        );
        mahasiswaId = result.insertId;
    }

    await db.promise().query(
        `INSERT INTO violations 
        (mahasiswa_id, id_kasus, jenis_kasus, status, hasil_sidang, notulensi, foto, deskripsi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [
            mahasiswaId,
            pelanggaran.id_kasus,
            pelanggaran.jenis_kasus,
            pelanggaran.status,
            pelanggaran.hasil_sidang,
            pelanggaran.notulensi,
            pelanggaran.foto || null,
            pelanggaran.deskripsi || null
        ]
    );

    return;
};

exports.update = (id, data, cb) => {
    const allowedFields = [
        "id_kasus", "jenis_kasus", "status", "hasil_sidang", "notulensi", "foto", "deskripsi"
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

exports.getViolationsByDate = async (start, end) => {
    let query = 'SELECT * FROM violations';
    let params = [];

    if (start && end) {
        query += ' WHERE DATE(created_at) BETWEEN ? AND ?';
        params.push(start, end);
    }

    query += ' ORDER BY created_at DESC LIMIT 100';

    const [rows] = await db.query(query, params);
    return rows;
};
