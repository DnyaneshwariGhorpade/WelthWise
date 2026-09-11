const goalsService = require('./service');
const { writeAuditLog } = require('../../common/audit');

function ipFromReq(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
}

async function getGoals(req, res, next) {
  try {
    res.status(200).json({ goals: await goalsService.listGoals(req.user.sub) });
  } catch (err) {
    next(err);
  }
}

async function createGoal(req, res, next) {
  try {
    const goal = await goalsService.createGoal(req.user.sub, req.body);
    await writeAuditLog({ userId: req.user.sub, action: 'GOAL_CREATED', resourceType: 'goal', resourceId: goal.id, ipAddress: ipFromReq(req) });
    res.status(201).json({ goal });
  } catch (err) {
    next(err);
  }
}

async function updateGoal(req, res, next) {
  try {
    const goal = await goalsService.updateGoal(req.user.sub, req.params.id, req.body);
    await writeAuditLog({ userId: req.user.sub, action: 'GOAL_UPDATED', resourceType: 'goal', resourceId: parseInt(req.params.id), ipAddress: ipFromReq(req) });
    res.status(200).json({ goal });
  } catch (err) {
    next(err);
  }
}

async function deleteGoal(req, res, next) {
  try {
    const result = await goalsService.deleteGoal(req.user.sub, req.params.id);
    await writeAuditLog({ userId: req.user.sub, action: 'GOAL_DELETED', resourceType: 'goal', resourceId: parseInt(req.params.id), ipAddress: ipFromReq(req) });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getConflicts(req, res, next) {
  try {
    res.status(200).json({ conflicts: await goalsService.listConflicts(req.user.sub) });
  } catch (err) {
    next(err);
  }
}

async function resolveConflict(req, res, next) {
  try {
    const result = await goalsService.resolveConflict(req.user.sub, req.params.id, req.body.action);
    await writeAuditLog({ userId: req.user.sub, action: `CONFLICT_${req.body.action}`, resourceType: 'goal_conflict', resourceId: parseInt(req.params.id), ipAddress: ipFromReq(req) });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, getConflicts, resolveConflict };
