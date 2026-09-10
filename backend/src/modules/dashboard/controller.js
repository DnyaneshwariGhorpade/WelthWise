const dashboardService = require('./service');

async function summary(req, res, next) {
  try {
    res.status(200).json({ summary: await dashboardService.summary(req.user.sub) });
  } catch (err) {
    next(err);
  }
}

async function trends(req, res, next) {
  try {
    res.status(200).json(await dashboardService.trends(req.user.sub));
  } catch (err) {
    next(err);
  }
}

async function insights(req, res, next) {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 6, 20);
    res.status(200).json({ insights: await dashboardService.insights(req.user.sub, limit) });
  } catch (err) {
    next(err);
  }
}

module.exports = { summary, trends, insights };