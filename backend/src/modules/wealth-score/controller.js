const wealthScoreService = require('./service');

async function getCurrent(req, res, next) {
  try {
    const latest = await wealthScoreService.ensureFresh(req.user.sub);
    if (!latest) return res.status(200).json({ score: null });
    res.status(200).json({ score: latest });
  } catch (err) {
    next(err);
  }
}

async function getHistory(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 12, 60);
    const history = await wealthScoreService.getHistory(req.user.sub, limit);
    res.status(200).json({ history });
  } catch (err) {
    next(err);
  }
}

async function explain(req, res, next) {
  try {
    const result = await wealthScoreService.explainLatest(req.user.sub);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { getCurrent, getHistory, explain };