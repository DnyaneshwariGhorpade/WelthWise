const stressService = require('./service');

async function getScenarios(req, res, next) {
  try {
    res.status(200).json({ scenarios: await stressService.listScenarios() });
  } catch (err) {
    next(err);
  }
}

async function getLatest(req, res, next) {
  try {
    res.status(200).json({ result: await stressService.getLatest(req.user.sub) });
  } catch (err) {
    next(err);
  }
}

async function run(req, res, next) {
  try {
    res.status(201).json({ result: await stressService.runScenario(req.user.sub, req.body.scenario_id) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getScenarios, getLatest, run };