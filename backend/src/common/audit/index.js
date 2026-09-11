// Immutable audit-log writer for critical financial-data operations (NFR-06).
// Rows in audit_logs are never updated or deleted.
const { pool } = require('../../config/db');

async function writeAuditLog({ userId, action, resourceType, resourceId, ipAddress }) {
  try {
    await pool.query(
      `INSERT INTO audit_logs (user_id, action, resource_type, resource_id, ip_address)
       VALUES ($1, $2, $3, $4, $5)`,
      [userId || null, action, resourceType || null, resourceId || null, ipAddress || null]
    );
  } catch (err) {
    console.error('Failed to write audit log:', err.message);
  }
}

const httpLogger = (req, res, next) => {
  res.on('finish', () => {
    console.info(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
};

module.exports = { httpLogger, writeAuditLog };
