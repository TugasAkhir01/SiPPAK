const db = require('../config/db');

exports.findByIdentifier = (identifier, callback) => {
    const query = `
        SELECT users.*, roles.name AS role_name
        FROM users
        JOIN roles ON users.role_id = roles.id
        WHERE users.nip = ? OR users.email = ?
        LIMIT 1
    `;
    db.query(query, [identifier, identifier], callback);
};
