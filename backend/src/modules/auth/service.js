const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { pool } = require('../../config/db');
const { ApiError } = require('../../common/errors');

const MAX_FAILED_ATTEMPTS = 5;
const LOCKOUT_MINUTES = 15;
const RESET_TOKEN_TTL_MIN = 60;

function signToken(user) {
  return jwt.sign(
    { sub: user.user_id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '15m' }
  );
}

function hashToken(raw) {
  return crypto.createHash('sha256').update(raw).digest('hex');
}

function generateResetToken() {
  return crypto.randomBytes(32).toString('hex');
}

function passwordStrengthCheck(pw) {
  const errors = [];
  if (pw.length < 8) errors.push('Password must be at least 8 characters');
  if (!/[A-Z]/.test(pw)) errors.push('Password must contain an uppercase letter');
  if (!/[a-z]/.test(pw)) errors.push('Password must contain a lowercase letter');
  if (!/[0-9]/.test(pw)) errors.push('Password must contain a number');
  return errors;
}

async function register({ full_name, email, password }) {
  const strengthErrors = passwordStrengthCheck(password);
  if (strengthErrors.length) {
    throw new ApiError(422, 'Password does not meet strength requirements', strengthErrors);
  }

  const existing = await pool.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (existing.rows.length) {
    throw new ApiError(409, 'An account with this email already exists');
  }

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
  const password_hash = await bcrypt.hash(password, salt);

  const result = await pool.query(
    `INSERT INTO users (full_name, email, password_hash)
     VALUES ($1, $2, $3)
     RETURNING user_id, full_name, email, role, account_status, created_at`,
    [full_name.trim(), email.toLowerCase(), password_hash]
  );

  const user = result.rows[0];
  const token = signToken(user);

  return {
    token,
    user: {
      id: user.user_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      status: user.account_status,
      createdAt: user.created_at,
    },
  };
}

async function login({ email, password }) {
  const result = await pool.query(
    `SELECT user_id, full_name, email, password_hash, role, account_status, failed_login_attempts, last_login_at
     FROM users WHERE email = $1`,
    [email.toLowerCase()]
  );

  if (!result.rows.length) {
    throw new ApiError(401, 'Invalid email or password');
  }

  const user = result.rows[0];

  if (user.account_status === 'LOCKED') {
    throw new ApiError(423, 'Account is locked due to too many failed login attempts. Try again later.');
  }

  if (user.account_status === 'DEACTIVATED') {
    throw new ApiError(403, 'This account has been deactivated');
  }

  const valid = await bcrypt.compare(password, user.password_hash);
  if (!valid) {
    const attempts = user.failed_login_attempts + 1;
    if (attempts >= MAX_FAILED_ATTEMPTS) {
      await pool.query(
        `UPDATE users SET failed_login_attempts = $1, account_status = 'LOCKED' WHERE user_id = $2`,
        [attempts, user.user_id]
      );
      throw new ApiError(423, 'Account locked after too many failed attempts');
    }
    await pool.query(
      'UPDATE users SET failed_login_attempts = $1 WHERE user_id = $2',
      [attempts, user.user_id]
    );
    throw new ApiError(401, 'Invalid email or password');
  }

  await pool.query(
    `UPDATE users SET failed_login_attempts = 0, last_login_at = CURRENT_TIMESTAMP WHERE user_id = $1`,
    [user.user_id]
  );

  const token = signToken(user);

  return {
    token,
    user: {
      id: user.user_id,
      fullName: user.full_name,
      email: user.email,
      role: user.role,
      status: user.account_status,
      lastLoginAt: user.last_login_at,
    },
  };
}

async function refreshToken(userId) {
  const result = await pool.query(
    `SELECT user_id, full_name, email, role, account_status FROM users WHERE user_id = $1`,
    [userId]
  );
  if (!result.rows.length) {
    throw new ApiError(401, 'User not found');
  }
  const user = result.rows[0];
  if (user.account_status !== 'ACTIVE') {
    throw new ApiError(403, 'Account is not active');
  }
  const token = signToken(user);
  return { token };
}

async function requestPasswordReset({ email }) {
  const result = await pool.query('SELECT user_id FROM users WHERE email = $1', [email.toLowerCase()]);
  if (!result.rows.length) {
    return { message: 'If an account exists with this email, a reset link has been sent.' };
  }

  const userId = result.rows[0].user_id;

  // Invalidate any previous unused tokens
  await pool.query('UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE', [userId]);

  const rawToken = generateResetToken();
  const tokenHashed = hashToken(rawToken);
  const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MIN * 60 * 1000);

  await pool.query(
    'INSERT INTO password_resets (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
    [userId, tokenHashed, expiresAt]
  );

  // TODO: Send email with `${process.env.APP_URL}/reset-password?token=${rawToken}` when email provider is configured
  console.log(`[PASSWORD RESET] token for ${email}: ${rawToken}`);

  return { message: 'If an account exists with this email, a reset link has been sent.', resetToken: process.env.NODE_ENV === 'development' ? rawToken : undefined };
}

async function resetPassword({ token, newPassword }) {
  const strengthErrors = passwordStrengthCheck(newPassword);
  if (strengthErrors.length) {
    throw new ApiError(422, 'Password does not meet strength requirements', strengthErrors);
  }

  const tokenHashed = hashToken(token);

  const result = await pool.query(
    `SELECT reset_id, user_id, expires_at FROM password_resets
     WHERE token_hash = $1 AND used = FALSE AND expires_at > NOW()`,
    [tokenHashed]
  );

  if (!result.rows.length) {
    throw new ApiError(400, 'Invalid or expired reset token');
  }

  const { reset_id, user_id } = result.rows[0];

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
  const password_hash = await bcrypt.hash(newPassword, salt);

  await pool.query('BEGIN');
  try {
    await pool.query('UPDATE users SET password_hash = $1, failed_login_attempts = 0, account_status = \'ACTIVE\' WHERE user_id = $2', [password_hash, user_id]);
    await pool.query('UPDATE password_resets SET used = TRUE WHERE reset_id = $1', [reset_id]);
    await pool.query('COMMIT');
  } catch (err) {
    await pool.query('ROLLBACK');
    throw err;
  }

  return { message: 'Password has been reset successfully' };
}

async function changePassword(userId, currentPassword, newPassword) {
  const strengthErrors = passwordStrengthCheck(newPassword);
  if (strengthErrors.length) {
    throw new ApiError(422, 'Password does not meet strength requirements', strengthErrors);
  }

  const result = await pool.query(
    'SELECT user_id, password_hash FROM users WHERE user_id = $1',
    [userId]
  );
  if (!result.rows.length) throw new ApiError(404, 'User not found');

  const valid = await bcrypt.compare(currentPassword, result.rows[0].password_hash);
  if (!valid) throw new ApiError(400, 'Current password is incorrect');

  const salt = await bcrypt.genSalt(parseInt(process.env.BCRYPT_SALT_ROUNDS) || 10);
  const password_hash = await bcrypt.hash(newPassword, salt);

  await pool.query(
    'UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE user_id = $2',
    [password_hash, userId]
  );

  // Invalidate outstanding reset tokens
  await pool.query(
    "UPDATE password_resets SET used = TRUE WHERE user_id = $1 AND used = FALSE AND expires_at > NOW()",
    [userId]
  );

  return { message: 'Password updated successfully' };
}

async function logout(token) {
  let blacklisted = false;
  try {
    const { createClient } = require('redis');
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379' });
    await client.connect();
    const ttlLeft = Math.max(0, decodeJwtTtl(token));
    if (ttlLeft > 0) {
      await client.set(`blacklist:${token}`, '1', { EX: ttlLeft });
      blacklisted = true;
    }
    await client.quit();
  } catch (err) {
    console.warn('Redis blacklist unavailable; skipping JWT revocation:', err.message);
  }
  return { blacklisted };
}

function decodeJwtTtl(token) {
  try {
    const payload = jwt.decode(token);
    if (!payload || !payload.exp) return 0;
    return Math.floor(payload.exp - Date.now() / 1000);
  } catch {
    return 0;
  }
}

module.exports = {
  register,
  login,
  refreshToken,
  requestPasswordReset,
  resetPassword,
  changePassword,
  logout,
  passwordStrengthCheck,
};
