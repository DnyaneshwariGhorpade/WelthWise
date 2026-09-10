const { Router } = require('express');
const { body } = require('express-validator');
const authMiddleware = require('../../middleware/auth.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');
const stressCtrl = require('./controller');

const router = Router();

router.use(authMiddleware);

router.get('/scenarios', stressCtrl.getScenarios);
router.get('/latest', stressCtrl.getLatest);
router.post(
  '/run',
  [body('scenario_id').isInt({ min: 1 }).withMessage('scenario_id is required')],
  validateMiddleware,
  stressCtrl.run
);

module.exports = router;