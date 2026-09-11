const usersService = require('./service');
const { writeAuditLog } = require('../../common/audit');

function ipFromReq(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
}

async function getMe(req, res, next) {
  try {
    res.status(200).json({ user: await usersService.getMe(req.user.sub) });
  } catch (err) {
    next(err);
  }
}

async function updateMe(req, res, next) {
  try {
    const user = await usersService.updateMe(req.user.sub, req.body);
    await writeAuditLog({ userId: req.user.sub, action: 'PROFILE_UPDATED', resourceType: 'user', resourceId: req.user.sub, ipAddress: ipFromReq(req) });
    res.status(200).json({ user });
  } catch (err) {
    next(err);
  }
}

module.exports = { getMe, updateMe };
