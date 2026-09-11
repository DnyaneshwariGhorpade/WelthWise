const { Router } = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../../middleware/auth.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');
const { evaluateDecision } = require('../goals/service');
const { writeAuditLog } = require('../../common/audit');

const router = Router();

router.use(authMiddleware);

router.post(
  '/evaluate',
  [body('decision_description').trim().notEmpty().withMessage('Describe the decision you want evaluated')],
  validateMiddleware,
  async (req, res, next) => {
    try {
      const evaluation = await evaluateDecision(req.user.sub, req.body.decision_description);
      await writeAuditLog({
        userId: req.user.sub,
        action: 'DECISION_EVALUATED',
        resourceType: 'decision_evaluation',
        resourceId: evaluation.id,
        ipAddress: req.headers['x-forwarded-for']?.split(',')[0]?.trim() || req.ip || null,
      });
      res.status(201).json({ evaluation });
    } catch (err) {
      next(err);
    }
  }
);

module.exports = router;
