const { Router } = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../../middleware/auth.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');
const { evaluateDecision } = require('../goals/service');

const router = Router();

router.use(authMiddleware);

router.post(
  '/evaluate',
  [body('decision_description').trim().notEmpty().withMessage('Describe the decision you want evaluated')],
  validateMiddleware,
  async (req, res, next) => {
    try {
      res.status(201).json({ evaluation: await evaluateDecision(req.user.sub, req.body.decision_description) });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;