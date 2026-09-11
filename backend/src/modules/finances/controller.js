const financeService = require('./service');
const { writeAuditLog } = require('../../common/audit');

function ipFromReq(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
}

async function getRecords(req, res, next) {
  try {
    const type = req.query.type;
    res.status(200).json(await financeService.getAll(req.user.sub, type));
  } catch (err) {
    next(err);
  }
}

async function createRecord(req, res, next) {
  try {
    const record = await financeService.create(req.user.sub, req.body.type, req.body);
    await writeAuditLog({ userId: req.user.sub, action: `FINANCE_${req.body.type.toUpperCase()}_CREATED`, resourceType: req.body.type, resourceId: record[`${req.body.type}_id`], ipAddress: ipFromReq(req) });
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
}

async function updateRecord(req, res, next) {
  try {
    const record = await financeService.update(req.user.sub, req.params.id, req.body.type, req.body);
    await writeAuditLog({ userId: req.user.sub, action: `FINANCE_${req.body.type.toUpperCase()}_UPDATED`, resourceType: req.body.type, resourceId: parseInt(req.params.id), ipAddress: ipFromReq(req) });
    res.status(200).json({ record });
  } catch (err) {
    next(err);
  }
}

async function deleteRecord(req, res, next) {
  try {
    const type = req.body.type || req.query.type;
    const result = await financeService.remove(req.user.sub, req.params.id, type);
    await writeAuditLog({ userId: req.user.sub, action: `FINANCE_${type.toUpperCase()}_DELETED`, resourceType: type, resourceId: parseInt(req.params.id), ipAddress: ipFromReq(req) });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecords, createRecord, updateRecord, deleteRecord };
