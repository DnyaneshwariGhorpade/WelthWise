const usersService = require('./service');

async function getMe(req, res, next) {
  try {
    res.status(200).json({ user: await usersService.getMe(req.user.sub) });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    res.status(200).json({ user: await usersService.updateMe(req.user.sub, req.body) });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe };