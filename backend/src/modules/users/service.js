const { pool } = require('../../config/db');
const { ApiError } = require('../../common/errors');

async function getMe(userId) {
  const result = await pool.query(
    `SELECT user_id, full_name, email, role, account_status, last_login_at, created_at
     FROM users WHERE user_id = $1`,
    [userId]
  );
  if (!result.rows.length) throw new ApiError(404, 'User not found');
  const u = result.rows[0];
  return {
    id: u.user_id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    status: u.account_status,
    lastLoginAt: u.last_login_at,
    createdAt: u.created_at,
  };
}

async function updateMe(userId, body) {
  const existing = await pool.query('SELECT email FROM users WHERE user_id = $1', [userId]);
  if (!existing.rows.length) throw new ApiError(404, 'User not found');

  const fullName = body.full_name !== undefined ? body.full_name : undefined;
  const email = body.email !== undefined ? String(body.email).toLowerCase() : undefined;

  if (email && email !== existing.rows[0].email) {
    const clash = await pool.query('SELECT user_id FROM users WHERE email = $1 AND user_id <> $2', [email, userId]);
    if (clash.rows.length) throw new ApiError(409, 'That email is already in use');
  }

  const result = await pool.query(
    `UPDATE users SET full_name = COALESCE($2, full_name), email = COALESCE($3, email), updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 RETURNING user_id, full_name, email, role, account_status`,
    [userId, fullName, email]
  );

  const u = result.rows[0];
  return {
    id: u.user_id,
    fullName: u.full_name,
    email: u.email,
    role: u.role,
    status: u.account_status,
  };
}

module.exports = { getMe, updateMe };