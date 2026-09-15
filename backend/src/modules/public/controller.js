const publicService = require('./service');

async function getHighlights(req, res, next) {
  try {
    const highlights = await publicService.getPublicHighlights();
    res.status(200).json(highlights);
  } catch (err) {
    next(err);
  }
}

module.exports = { getHighlights };
