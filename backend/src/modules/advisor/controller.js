const advisorService = require('./service');

async function chat(req, res, next) {
  try {
    const result = await advisorService.sendMessage(req.user.sub, req.body.message);
    res.status(201).json({ reply: result });
  } catch (err) {
    next(err);
  }
}

async function history(req, res, next) {
  try {
    const messages = await advisorService.getHistory(req.user.sub);
    res.status(200).json({ messages });
  } catch (err) {
    next(err);
  }
}

module.exports = { chat, history };