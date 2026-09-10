const { Router } = require('express');
const { body, param } = require('express-validator');
const authMiddleware = require('../../middleware/auth.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');
const goalsCtrl = require('./controller');

const router = Router();

router.use(authMiddleware);

router.get('/', goalsCtrl.getGoals);
router.post(
  '/',
  [
    body('goal_name').trim().notEmpty().withMessage('Goal name is required'),
    body('target_amount').isFloat({ min: 0 }).withMessage('Target amount must be a non-negative number'),
    body('priority').optional().isInt({ min: 1, max: 5 }).withMessage('Priority must be between 1 and 5'),
  ],
  validateMiddleware,
  goalsCtrl.createGoal
);
router.put('/:id', [param('id').isInt()], validateMiddleware, goalsCtrl.updateGoal);
router.delete('/:id', [param('id').isInt()], validateMiddleware, goalsCtrl.deleteGoal);

router.get('/conflicts', goalsCtrl.getConflicts);
router.post(
  '/conflicts/:id/resolve',
  [
    param('id').isInt().withMessage('Conflict id must be an integer'),
    body('action').isIn(['ACCEPTED', 'MODIFIED', 'DISMISSED']).withMessage('action must be ACCEPTED, MODIFIED or DISMISSED'),
  ],
  validateMiddleware,
  goalsCtrl.resolveConflict
);

module.exports = router;