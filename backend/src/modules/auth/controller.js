const authService = require('./service');
const { writeAuditLog } = require('../../common/audit');

function ipFromReq(req) {
  return req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null;
}

async function register(req, res, next) {
  try {
    const { full_name, email, password } = req.body;
    const result = await authService.register({ full_name, email, password });
    await writeAuditLog({ userId: result.user.id, action: 'USER_REGISTERED', resourceType: 'user', resourceId: result.user.id, ipAddress: ipFromReq(req) });
    res.status(201).json(result);
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const result = await authService.login({ email, password });
    await writeAuditLog({ userId: result.user.id, action: 'USER_LOGIN', resourceType: 'user', resourceId: result.user.id, ipAddress: ipFromReq(req) });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function refresh(req, res, next) {
  try {
    const result = await authService.refreshToken(req.user.sub);
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function forgotPassword(req, res, next) {
  try {
    const { email } = req.body;
    const result = await authService.requestPasswordReset({ email });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function resetPassword(req, res, next) {
  try {
    const { token, password } = req.body;
    const result = await authService.resetPassword({ token, newPassword: password });
    await writeAuditLog({ action: 'PASSWORD_RESET', resourceType: 'user', ipAddress: ipFromReq(req) });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function getProfile(req, res, next) {
  try {
    const { pool } = require('../../config/db');
    const result = await pool.query(
      'SELECT user_id, full_name, email, role, account_status, created_at FROM users WHERE user_id = $1',
      [req.user.sub]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: { message: 'User not found' } });
    }
    const u = result.rows[0];
    res.status(200).json({
      id: u.user_id,
      fullName: u.full_name,
      email: u.email,
      role: u.role,
      status: u.account_status,
      createdAt: u.created_at,
    });
  } catch (err) {
    next(err);
  }
}

async function changePassword(req, res, next) {
  try {
    const { current_password: currentPassword, new_password: newPassword } = req.body;
    const result = await authService.changePassword(req.user.sub, currentPassword, newPassword);
    await writeAuditLog({ userId: req.user.sub, action: 'PASSWORD_CHANGED', resourceType: 'user', resourceId: req.user.sub, ipAddress: ipFromReq(req) });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

async function logout(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    const result = await authService.logout(token);
    await writeAuditLog({ userId: req.user.sub, action: 'USER_LOGOUT', resourceType: 'user', resourceId: req.user.sub, ipAddress: ipFromReq(req) });
    res.status(200).json(result);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, refresh, forgotPassword, resetPassword, getProfile, changePassword, logout };
