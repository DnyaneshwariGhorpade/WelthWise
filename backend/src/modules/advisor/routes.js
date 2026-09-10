const { Router } = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../../middleware/auth.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');
const advisorCtrl = require('./controller');

const router = Router();

router.use(authMiddleware);

router.post(
  '/chat',
  [body('message').trim().notEmpty().withMessage('Message is required')],
  validateMiddleware,
  advisorCtrl.chat
);
router.get('/history', advisorCtrl.history);

module.exports = router;