const financeService = require('./service');

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
    res.status(201).json({ record });
  } catch (err) {
    next(err);
  }
}

async function updateRecord(req, res, next) {
  try {
    const record = await financeService.update(req.user.sub, req.params.id, req.body.type, req.body);
    res.status(200).json({ record });
  } catch (err) {
    next(err);
  }
}

async function deleteRecord(req, res, next) {
  try {
    const type = req.body.type || req.query.type;
    const result = await financeService.remove(req.user.sub, req.params.id, type);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getRecords, createRecord, updateRecord, deleteRecord };