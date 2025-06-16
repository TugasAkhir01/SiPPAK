const Violation = require('../models/violationModel');
const path = require('path');
const { moveFileToFinalLocation } = require('../helpers/fileHelper');

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

exports.createWithUpload = async (req, res) => {
    try {
        let mahasiswa, pelanggaran;

        try {
            mahasiswa = JSON.parse(req.body.mahasiswa);
            pelanggaran = JSON.parse(req.body.pelanggaran);
        } catch (err) {
            return res.status(400).json({ error: 'Format JSON mahasiswa atau pelanggaran tidak valid' });
        }

        if (!mahasiswa || !mahasiswa.nim) {
            return res.status(400).json({ error: 'Data mahasiswa tidak lengkap' });
        }
        if (!pelanggaran || !pelanggaran.id_kasus) {
            return res.status(400).json({ error: 'Data pelanggaran tidak lengkap' });
        }

        if (req.files?.hasil_sidang_path?.[0]) {
            const tempPath = req.files.hasil_sidang_path[0].path;
            pelanggaran.hasil_sidang = moveFileToFinalLocation(tempPath, 'hasil_sidang');
        }
        if (req.files?.notulensi_path?.[0]) {
            const tempPath = req.files.notulensi_path[0].path;
            pelanggaran.notulensi = moveFileToFinalLocation(tempPath, 'notulensi');
        }
        if (req.files?.photo_path?.[0]) {
            const tempPath = req.files.photo_path[0].path;
            pelanggaran.foto = moveFileToFinalLocation(tempPath, 'photo');
        }

        if (req.body.deskripsi) {
            pelanggaran.deskripsi = req.body.deskripsi;
        }

        await Violation.create(mahasiswa, pelanggaran);

        res.status(201).json({
            message: 'Data berhasil ditambahkan dan file dipindahkan ke folder final',
            data: {
                mahasiswa,
                pelanggaran,
                files: {
                    hasil_sidang: pelanggaran.hasil_sidang || null,
                    notulensi: pelanggaran.notulensi || null,
                    foto: pelanggaran.foto || null
                }
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Gagal menambahkan data pelanggaran' });
    }
};

exports.update = (req, res) => {
    let data;

    try {
        data = JSON.parse(req.body.pelanggaran);
    } catch (e) {
        return res.status(400).json({ error: "Format JSON pelanggaran tidak valid" });
    }

    if (req.body.hasil_sidang_path) {
        const tempPath = path.join('uploads', 'temp', req.body.hasil_sidang_path);
        const result = moveFileToFinalLocation(tempPath, 'hasil_sidang');
        if (result) data.hasil_sidang = result;
    }

    if (req.body.notulensi_path) {
        const tempPath = path.join('uploads', 'temp', req.body.notulensi_path);
        const result = moveFileToFinalLocation(tempPath, 'notulensi');
        if (result) data.notulensi = result;
    }

    if (req.body.photo_path) {
        const tempPath = path.join('uploads', 'temp', req.body.photo_path);
        const result = moveFileToFinalLocation(tempPath, 'photo');
        if (result) data.foto = result;
    }

    Violation.update(req.params.id, data, (err) => {
        if (err) return res.status(500).send(err);

        Violation.getById(req.params.id, (err, result) => {
            if (err) return res.status(500).send(err);
            if (!result || result.length === 0) return res.status(404).json({ error: 'Data tidak ditemukan' });

            const row = result[0];

            res.json({
                message: 'Data Pelanggaran berhasil diupdate',
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
                        foto: row.foto
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

        const tryDeleteFile = (filePath, folder) => {
            if (!filePath) return;
            const fullPath = path.join('uploads', folder, filePath);
            if (fs.existsSync(fullPath)) {
                fs.unlinkSync(fullPath);
            }
        };

        tryDeleteFile(row.hasil_sidang, 'hasil_sidang');
        tryDeleteFile(row.notulensi, 'notulensi');
        tryDeleteFile(row.foto, 'photo');

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
                        notulensi: row.notulensi,
                        foto: row.foto
                    }
                }
            });
        });
    });
};


