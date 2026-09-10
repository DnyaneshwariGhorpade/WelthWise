const { validationResult } = require('express-validator');
const { ApiError } = require('../common/errors');

module.exports = function validateMiddleware(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const details = errors.array().map((e) => ({ field: e.path, message: e.msg }));
    return next(new ApiError(422, 'Validation failed', details));
  }
  next();
};
