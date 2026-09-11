const { ApiError } = require('../common/errors');

module.exports = function adminMiddleware(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return next(new ApiError(403, 'Administrator access required'));
  }
  next();
};
