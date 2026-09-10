const { Router } = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const wealthScoreCtrl = require('./controller');

const router = Router();

router.use(authMiddleware);

router.get('/', wealthScoreCtrl.getCurrent);
router.get('/history', wealthScoreCtrl.getHistory);
router.post('/explain', wealthScoreCtrl.explain);

module.exports = router;