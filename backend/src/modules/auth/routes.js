const { Router } = require('express');
const { body } = require('express-validator');
const authCtrl = require('./controller');
const authMiddleware = require('../../middleware/auth.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');

const router = Router();

router.post(
  '/register',
  [
    body('full_name').trim().notEmpty().withMessage('Full name is required').isLength({ max: 150 }),
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validateMiddleware,
  authCtrl.register
);

router.post(
  '/login',
  [
    body('email').isEmail().withMessage('Valid email is required').normalizeEmail(),
    body('password').notEmpty().withMessage('Password is required'),
  ],
  validateMiddleware,
  authCtrl.login
);

router.post('/refresh', authMiddleware, authCtrl.refresh);

router.post('/logout', authMiddleware, authCtrl.logout);

router.get('/profile', authMiddleware, authCtrl.getProfile);

router.post(
  '/change-password',
  [
    body('current_password').notEmpty().withMessage('Current password is required'),
    body('new_password').isLength({ min: 8 }).withMessage('New password must be at least 8 characters'),
  ],
  validateMiddleware,
  authCtrl.changePassword
);

router.post(
  '/forgot-password',
  [body('email').isEmail().withMessage('Valid email is required').normalizeEmail()],
  validateMiddleware,
  authCtrl.forgotPassword
);

router.post(
  '/reset-password',
  [
    body('token').notEmpty().withMessage('Reset token is required'),
    body('password').isLength({ min: 8 }).withMessage('Password must be at least 8 characters'),
  ],
  validateMiddleware,
  authCtrl.resetPassword
);

module.exports = router;
