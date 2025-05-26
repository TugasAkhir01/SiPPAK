const db = require('../config/db');

exports.findByIdentifier = (identifier, callback) => {
    const query = `SELECT * FROM users WHERE nip = ? OR email = ? LIMIT 1`;
    db.query(query, [identifier, identifier], callback);
};
