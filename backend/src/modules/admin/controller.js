const adminService = require('./service');
const { writeAuditLog } = require('../../common/audit');

function ipFromReq(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
}

function parseUserFilter(raw) {
  if (raw === undefined || raw === null || raw === '') return undefined;
  const n = parseInt(raw, 10);
  return Number.isNaN(n) ? undefined : n;
}

async function getUsageSummary(req, res, next) {
  try {
    res.status(200).json({ summary: await adminService.getUsageSummary() });
  } catch (err) {
    next(err);
  }
}

async function getSystemStatus(req, res, next) {
  try {
    res.status(200).json({ status: await adminService.getSystemStatus() });
  } catch (err) {
    next(err);
  }
}

async function getAIConfig(req, res, next) {
  try {
    res.status(200).json({ config: await adminService.getAIConfig() });
  } catch (err) {
    next(err);
  }
}

async function updateAIConfig(req, res, next) {
  try {
    const { provider } = req.body;
    const config = await adminService.updateAIConfig(provider);
    await writeAuditLog({
      userId: req.user.sub,
      action: 'AI_PROVIDER_SWITCHED',
      resourceType: 'ai_config',
      resourceId: null,
      ipAddress: ipFromReq(req),
    });
    res.status(200).json({ config });
  } catch (err) {
    next(err);
  }
}

async function getAuditLogs(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(Math.max(1, parseInt(req.query.limit) || 50), 200);
    const result = await adminService.getAuditLogs({
      search: req.query.search || undefined,
      action: req.query.action || undefined,
      userId: parseUserFilter(req.query.user_id),
      page,
      limit,
    });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function exportAuditLogs(req, res, next) {
  try {
    const format = req.query.format === 'json' ? 'json' : 'csv';
    const result = await adminService.exportAuditLogs({
      search: req.query.search || undefined,
      action: req.query.action || undefined,
      userId: parseUserFilter(req.query.user_id),
      format,
    });

    if (format === 'csv') {
      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', 'attachment; filename=audit-logs.csv');
      return res.status(200).send(result.data);
    }

    res.status(200).json({ logs: result.data });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  getUsageSummary,
  getSystemStatus,
  getAIConfig,
  updateAIConfig,
  getAuditLogs,
  exportAuditLogs,
};