const { db } = require('../config/db');

exports.saveExportLog = async (filename) => {
    const [result] = await db.promise().query(
        'INSERT INTO report_exports (filename, created_at) VALUES (?, NOW())',
        [filename]
    );
    return result.insertId;
};
