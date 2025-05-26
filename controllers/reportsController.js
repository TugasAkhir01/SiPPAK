const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');
const violationModel = require('../models/violationModel');
const reportExportModel = require('../models/reportExportModel');

exports.exportReport = async (req, res) => {
  try {
    const { start_date, end_date } = req.body;

    const violations = await violationModel.getViolationsByDate(start_date, end_date);

    const doc = new PDFDocument({ margin: 50 });
    const fileName = `report-${Date.now()}.pdf`;
    const filePath = path.join(__dirname, '../exports', fileName);
    const writeStream = fs.createWriteStream(filePath);

    doc.pipe(writeStream);

    const logoPath = path.join(__dirname, '../assets/telkom-logo.png');
    if (fs.existsSync(logoPath)) {
      doc.image(logoPath, { fit: [100, 100], align: 'center' });
    }

    doc.moveDown();
    doc.fontSize(20).text('Laporan Pelanggaran Mahasiswa', { align: 'center' });
    doc.moveDown();

    doc.fontSize(12).text('No', 50, doc.y, { continued: true });
    doc.text('NIM', 80, doc.y, { continued: true });
    doc.text('Jenis', 150, doc.y, { continued: true });
    doc.text('Deskripsi', 250, doc.y, { continued: true });
    doc.text('Tanggal', 450, doc.y);

    doc.moveDown(0.5);
    doc.moveTo(50, doc.y).lineTo(550, doc.y).stroke();
    doc.moveDown();

    violations.forEach((v, i) => {
      doc.text(`${i + 1}`, 50, doc.y, { continued: true });
      doc.text(`${v.nim}`, 80, doc.y, { continued: true });
      doc.text(`${v.type}`, 150, doc.y, { continued: true });
      doc.text(`${v.description}`, 250, doc.y, { continued: true });
      doc.text(`${v.created_at}`, 450, doc.y);
    });

    doc.end();

    writeStream.on('finish', async () => {
      await reportExportModel.saveExportLog(fileName);
      res.download(filePath);
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Gagal mengekspor laporan' });
  }
};
