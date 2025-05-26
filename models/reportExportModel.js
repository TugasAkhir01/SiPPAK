const db = require('../config/db');

exports.saveExportLog = async (filename) => {
  await db.query('INSERT INTO report_exports (filename) VALUES (?)', [filename]);
};
