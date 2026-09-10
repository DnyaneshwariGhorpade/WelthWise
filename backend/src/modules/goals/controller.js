const goalsService = require('./service');

async function getGoals(req, res, next) {
  try {
    res.status(200).json({ goals: await goalsService.listGoals(req.user.sub) });
  } catch (err) {
    next(err);
  }
}

async function createGoal(req, res, next) {
  try {
    res.status(201).json({ goal: await goalsService.createGoal(req.user.sub, req.body) });
  } catch (err) {
    next(err);
  }
}

async function updateGoal(req, res, next) {
  try {
    res.status(200).json({ goal: await goalsService.updateGoal(req.user.sub, req.params.id, req.body) });
  } catch (err) {
    next(err);
  }
}

async function deleteGoal(req, res, next) {
  try {
    res.status(200).json(await goalsService.deleteGoal(req.user.sub, req.params.id));
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
    res.status(200).json(await goalsService.resolveConflict(req.user.sub, req.params.id, req.body.action));
  } catch (err) {
    next(err);
  }
}

module.exports = { getGoals, createGoal, updateGoal, deleteGoal, getConflicts, resolveConflict };