const Violation = require('../models/violationModel');
const reportExportModel = require('../models/reportExportModel');
const path = require('path');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const { moveFileToFinalLocation } = require('../helpers/fileHelper');
const { db } = require('../config/db');

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
        console.log("BODY MAHASISWA:", req.body.mahasiswa);
        try {
            mahasiswa = JSON.parse(req.body.mahasiswa);
            console.log("PARSED NAMA:", parsed.nama);
            pelanggaran = JSON.parse(req.body.pelanggaran);
        } catch (err) {
            return res.status(400).json({ error: 'Format JSON mahasiswa atau pelanggaran tidak valid' });
            console.error("GAGAL PARSE mahasiswa:", e.message);
        }

        if (!mahasiswa || !mahasiswa.nim) return res.status(400).json({ error: 'Data mahasiswa tidak lengkap' });
        if (!pelanggaran || !pelanggaran.id_kasus) return res.status(400).json({ error: 'Data pelanggaran tidak lengkap' });

        mahasiswa.semester = parseInt(mahasiswa.semester) || null;
        pelanggaran.status_approval = pelanggaran.status_approval || 'Pending';
        pelanggaran.type = pelanggaran.type || 'New';

        // ⬇️ Dari file fisik (via FormData)
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

        // ⬇️ Fallback dari string path
        if (!pelanggaran.hasil_sidang && req.body.hasil_sidang_path) {
            const tempPath = path.join('uploads', 'temp', req.body.hasil_sidang_path);
            pelanggaran.hasil_sidang = moveFileToFinalLocation(tempPath, 'hasil_sidang');
        }
        if (!pelanggaran.notulensi && req.body.notulensi_path) {
            const tempPath = path.join('uploads', 'temp', req.body.notulensi_path);
            pelanggaran.notulensi = moveFileToFinalLocation(tempPath, 'notulensi');
        }
        if (!pelanggaran.foto && req.body.photo_path) {
            const tempPath = path.join('uploads', 'temp', req.body.photo_path);
            pelanggaran.foto = moveFileToFinalLocation(tempPath, 'photo');
        }

        if (req.body.deskripsi) {
            pelanggaran.deskripsi = req.body.deskripsi;
        }

        await Violation.create(mahasiswa, pelanggaran);

        res.status(201).json({
            message: 'Data berhasil ditambahkan dan file dipindahkan ke folder final',
            data: { mahasiswa, pelanggaran }
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

    // ⬇️ Pindahkan file jika diberikan
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
                        semester: row.semester
                    },
                    pelanggaran: {
                        id: row.id,
                        id_kasus: row.id_kasus,
                        jenis_kasus: row.jenis_kasus,
                        status: row.status,
                        hasil_sidang: row.hasil_sidang,
                        notulensi: row.notulensi,
                        foto: row.foto,
                        status_approval: row.status_approval,
                        type: row.type
                    }
                }
            });
        });
    });
};

exports.updateStatusApproval = (req, res) => {
    const { id } = req.params;
    const { status_approval } = req.body;

    if (!['Pending', 'Approved', 'Rejected'].includes(status_approval)) {
        return res.status(400).json({ error: 'Status tidak valid' });
    }

    Violation.update(id, { status_approval }, (err) => {
        if (err) return res.status(500).send(err);
        res.json({ message: 'Status approval berhasil diperbarui' });
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
            if (fs.existsSync(fullPath)) fs.unlinkSync(fullPath);
        };

        tryDeleteFile(row.hasil_sidang, 'hasil_sidang');
        tryDeleteFile(row.notulensi, 'notulensi');
        tryDeleteFile(row.foto, 'photo');

        Violation.delete(id, (err) => {
            if (err) return res.status(500).send(err);
            res.json({ message: 'Data Pelanggaran berhasil dihapus' });
        });
    });
};

exports.exportReport = async (req, res) => {
    try {
        const { id, type } = req.body;
        const exportType = type || 'hasil_sidang'; // default ke hasil_sidang
        console.log('[EXPORT] Request body:', req.body);

        if (!id) {
            console.log('[EXPORT] ID tidak dikirim');
            return res.status(400).json({ message: 'ID tidak boleh kosong' });
        }

        const detail = await new Promise((resolve, reject) => {
            Violation.getById(id, (err, result) => {
                if (err) {
                    console.error('[EXPORT] DB error:', err);
                    return reject(err);
                }
                resolve(result[0]);
            });
        });

        if (!detail) {
            console.log('[EXPORT] Data tidak ditemukan untuk ID:', id);
            return res.status(404).json({ message: 'Data tidak ditemukan' });
        }

        // Pastikan folder export ada
        const exportDir = path.join(__dirname, '../exports');
        if (!fs.existsSync(exportDir)) {
            fs.mkdirSync(exportDir, { recursive: true });
            console.log('[EXPORT] Folder exports dibuat');
        }

        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument();
        const fileName = `${exportType}_${id}_${Date.now()}.pdf`;
        const filePath = path.join(exportDir, fileName);
        const stream = fs.createWriteStream(filePath);
        doc.pipe(stream);

        // Header
        doc.fontSize(18).text(
            exportType === 'notulensi' ? 'Notulensi Sidang Pelanggaran' : 'Hasil Sidang Pelanggaran Mahasiswa',
            { align: 'center' }
        );
        doc.moveDown();

        // Tentukan path file
        const fileField = exportType === 'notulensi' ? detail.notulensi : detail.hasil_sidang;
        const folder = exportType === 'notulensi' ? 'notulensi_sidang' : 'hasil_sidang';
        const fileSourcePath = path.join(__dirname, '../uploads/data_pelanggaran', folder, fileField || '');
        console.log(`[EXPORT] Checking file: ${fileSourcePath}`);

        if (fileField && fs.existsSync(fileSourcePath)) {
            const ext = path.extname(fileSourcePath).toLowerCase();

            if (ext === '.docx') {
                try {
                    const result = await mammoth.extractRawText({ path: fileSourcePath });
                    const fileText = result.value || '[File kosong]';
                    doc.text(fileText.trim());
                } catch (extractErr) {
                    console.error('[EXPORT] Gagal membaca file DOCX:', extractErr);
                    doc.text('Gagal membaca isi file DOCX');
                }
            } else if (ext === '.pdf') {
                try {
                    const dataBuffer = fs.readFileSync(fileSourcePath);
                    const data = await pdfParse(dataBuffer);
                    const pdfText = data.text || '[PDF kosong]';
                    doc.text(pdfText.trim());
                } catch (pdfErr) {
                    console.error('[EXPORT] Gagal membaca file PDF:', pdfErr);
                    doc.text('Gagal membaca isi file PDF');
                }
            } else if (ext === '.doc') {
                doc.text('File .doc terdeteksi, tetapi tidak didukung untuk dibaca. Harap unggah file .docx.');
            } else {
                doc.text(`File berformat ${ext} tidak didukung untuk ditampilkan.`);
            }
        } else {
            doc.text('File tidak ditemukan');
        }

        doc.end();

        stream.on('finish', async () => {
            console.log('[EXPORT] PDF finished. Checking file availability...');

            try {
                // Pastikan file benar-benar tersedia dulu
                await fs.promises.access(filePath, fs.constants.F_OK);

                await reportExportModel.saveExportLog(fileName);
                res.setHeader('Content-Type', 'application/pdf');
                res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
                res.sendFile(fileName, {
                    root: exportDir, // yaitu path.join(__dirname, '../exports')
                    headers: {
                        'Content-Type': 'application/pdf',
                        'Content-Disposition': `attachment; filename="${fileName}"`
                    }
                }, (err) => {
                    if (err) {
                        console.error('[EXPORT] Gagal mengirim file PDF:', err);
                        return res.status(500).json({ message: 'Gagal mengunduh file hasil export' });
                    }
                });
            } catch (fileErr) {
                console.error('[EXPORT] File tidak ditemukan setelah selesai ditulis:', fileErr);
                res.status(500).json({ message: 'File export PDF tidak ditemukan' });
            }
        });

        stream.on('error', (err) => {
            console.error('[EXPORT STREAM ERROR]', err);
            res.status(500).json({ message: 'Gagal menulis file PDF' });
        });

    } catch (err) {
        console.error('[EXPORT ERROR]', err);
        res.status(500).json({ message: 'Gagal mengekspor hasil' });
    }
};
