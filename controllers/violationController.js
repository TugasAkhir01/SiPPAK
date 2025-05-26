const Violation = require('../models/violationModel');

exports.getAll = (req, res) => {
    Violation.getAll((err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
};

exports.getById = (req, res) => {
    Violation.getById(req.params.id, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result[0] || {});
    });
};

exports.getByNIM = (req, res) => {
    Violation.getByNIM(req.params.nim, (err, result) => {
        if (err) return res.status(500).send(err);
        res.json(result);
    });
};

exports.create = async (req, res) => {
    const { mahasiswa, pelanggaran } = req.body;

    try {
        await Violation.create(mahasiswa, pelanggaran);
        res.status(201).json({
            message: 'Data berhasil ditambahkan.',
            data: {
                mahasiswa,
                pelanggaran
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menambahkan data' });
    }
};

exports.update = (req, res) => {
    const data = req.body.pelanggaran;

    Violation.update(req.params.id, data, (err) => {
        if (err) return res.status(500).send(err);

        Violation.getById(req.params.id, (err, result) => {
            if (err) return res.status(500).send(err);
            if (!result || result.length === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });

            const row = result[0];

            res.json({
                message: 'Data Pelanggaran berhasil diupdated',
                data: {
                    mahasiswa: {
                        nama: row.nama,
                        nim: row.nim,
                        jurusan: row.jurusan,
                    },
                    pelanggaran: {
                        id: row.id,
                        id_kasus: row.id_kasus,
                        jenis_kasus: row.jenis_kasus,
                        status: row.status,
                        hasil_sidang: row.hasil_sidang,
                        notulensi: row.notulensi,
                    }
                }
            });
        });
    });
};

exports.delete = (req, res) => {
    const id = req.params.id;

    Violation.getById(id, (err, result) => {
        if (err) return res.status(500).send(err);
        if (!result || result.length === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });

        const row = result[0];

        Violation.delete(id, (err) => {
            if (err) return res.status(500).send(err);
            res.json({
                message: 'Data Pelanggaran berhasil dihapus',
                data: {
                    mahasiswa: {
                        nama: row.nama,
                        nim: row.nim,
                        jurusan: row.jurusan
                    },
                    pelanggaran: {
                        id: row.id,
                        id_kasus: row.id_kasus,
                        jenis_kasus: row.jenis_kasus,
                        status: row.status,
                        hasil_sidang: row.hasil_sidang,
                        notulensi: row.notulensi
                    }
                }
            });
        });
    });
};

