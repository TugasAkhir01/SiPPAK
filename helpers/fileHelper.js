const fs = require('fs');
const path = require('path');

function moveFileToFinalLocation(tempPath, type) {
    const folderMap = {
        'hasil_sidang': 'hasil_sidang',
        'notulensi': 'notulensi_sidang',
        'photo': 'photo'
    };

    const folderName = folderMap[type];
    if (!folderName) {
        console.warn(`❌ Jenis folder tidak dikenali: ${type}`);
        return null;
    }

    // Jika file sudah ada di folder final, skip
    if (tempPath.includes('data_pelanggaran')) {
        return path.basename(tempPath);
    }

    if (!fs.existsSync(tempPath)) {
        console.warn(`⚠️ File tidak ditemukan: ${tempPath}`);
        return null;
    }

    const filename = path.basename(tempPath);
    const finalFolder = path.join('uploads', 'data_pelanggaran', folderName);
    const finalPath = path.join(finalFolder, filename);

    fs.mkdirSync(finalFolder, { recursive: true });

    try {
        fs.renameSync(tempPath, finalPath);
        return filename;
    } catch (err) {
        console.error(`❌ Gagal memindahkan file: ${tempPath} -> ${finalPath}`);
        console.error(err);
        return null;
    }
}

function deleteOldFile(relativePath) {
    const absolutePath = path.join(__dirname, '..', relativePath);
    if (fs.existsSync(absolutePath)) {
        fs.unlinkSync(absolutePath);
    }
}

module.exports = {
    moveFileToFinalLocation,
    deleteOldFile
};
