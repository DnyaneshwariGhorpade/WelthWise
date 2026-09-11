const { Router } = require('express');
const { body, query } = require('express-validator');
const authMiddleware = require('../../middleware/auth.middleware');
const adminMiddleware = require('../../middleware/admin.middleware');
const validateMiddleware = require('../../middleware/validate.middleware');
const adminCtrl = require('./controller');

const router = Router();

router.use(authMiddleware);
router.use(adminMiddleware);

router.get('/usage-summary', adminCtrl.getUsageSummary);
router.get('/system-status', adminCtrl.getSystemStatus);

router.get('/ai-config', adminCtrl.getAIConfig);
router.put(
  '/ai-config',
  [body('provider').isIn(['openai', 'gemini']).withMessage('Provider must be openai or gemini')],
  validateMiddleware,
  adminCtrl.updateAIConfig
);

router.get('/audit-logs', adminCtrl.getAuditLogs);
router.get('/audit-logs/export', adminCtrl.exportAuditLogs);

module.exports = router;
