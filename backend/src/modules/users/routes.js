const { Router } = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../../middleware/auth.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');
const usersCtrl = require('./controller');

const router = Router();

router.use(authMiddleware);

router.get('/me', usersCtrl.getMe);
router.put(
  '/me',
  [
    body('full_name').optional().trim().isLength({ min: 1, max: 150 }),
    body('email').optional().isEmail().normalizeEmail(),
  ],
  validateMiddleware,
  usersCtrl.updateMe
);

module.exports = router;