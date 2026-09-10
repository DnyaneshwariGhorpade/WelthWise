const { Router } = require('express');
const { body, query, param } = require('express-validator');
const authMiddleware = require('../../middleware/auth.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');
const financeCtrl = require('./controller');

const router = Router();

router.use(authMiddleware);

router.get(
  '/records',
  [query('type').optional().isIn(['income', 'expense', 'asset', 'liability', 'investment'])],
  validateMiddleware,
  financeCtrl.getRecords
);

router.post(
  '/records',
  [body('type').isIn(['income', 'expense', 'asset', 'liability', 'investment']).withMessage('A valid type is required')],
  validateMiddleware,
  financeCtrl.createRecord
);

router.put(
  '/records/:id',
  [
    param('id').isInt().withMessage('Record id must be an integer'),
    body('type').isIn(['income', 'expense', 'asset', 'liability', 'investment']).withMessage('A valid type is required'),
  ],
  validateMiddleware,
  financeCtrl.updateRecord
);

router.delete(
  '/records/:id',
  [param('id').isInt().withMessage('Record id must be an integer')],
  validateMiddleware,
  financeCtrl.deleteRecord
);

module.exports = router;