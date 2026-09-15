const jwt = require('jsonwebtoken');
const { ApiError } = require('../common/errors');

let redisClient = null;
let redisChecked = false;

async function getRedis() {
  if (process.env.NODE_ENV === 'test') return null;
  if (redisChecked) return redisClient;
  redisChecked = true;
  try {
    const { createClient } = require('redis');
    const client = createClient({ url: process.env.REDIS_URL || 'redis://localhost:6379', socket: { connectTimeout: 1500 } });
    await client.connect();
    redisClient = client;
    return client;
  } catch (err) {
    console.warn('Redis unavailable; JWT blacklist disabled:', err.message);
    return null;
  }
}

async function isBlacklisted(token) {
  try {
    const client = await getRedis();
    if (!client) return false;
    const exists = await client.get(`blacklist:${token}`);
    return !!exists;
  } catch (err) {
    console.warn('Redis blacklist check failed:', err.message);
    return false;
  }
}

async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (await isBlacklisted(token)) {
      return next(new ApiError(401, 'Session has been revoked'));
    }
    req.user = decoded;
    next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next(new ApiError(401, 'Token expired'));
    }
    return next(new ApiError(401, 'Invalid token'));
  }
}

async function refreshAuthMiddleware(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return next(new ApiError(401, 'Authentication required'));
  }

  const token = header.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET, { ignoreExpiration: true });
    if (await isBlacklisted(token)) {
      return next(new ApiError(401, 'Session has been revoked'));
    }
    req.user = decoded;
    next();
  } catch (err) {
    return next(new ApiError(401, 'Invalid token for refresh'));
  }
}

module.exports = authMiddleware;
module.exports.authMiddleware = authMiddleware;
module.exports.refreshAuthMiddleware = refreshAuthMiddleware;