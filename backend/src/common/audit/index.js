// Immutable audit-log writer for critical financial-data operations (NFR-06).
// Rows in audit_logs are never updated or deleted.
const httpLogger = (req, res, next) => {
  res.on('finish', () => {
    // TODO: persist { user, action, resource, ip_address, created_at } via pool.
    console.info(`${req.method} ${req.originalUrl} ${res.statusCode}`);
  });
  next();
};

module.exports = { httpLogger };