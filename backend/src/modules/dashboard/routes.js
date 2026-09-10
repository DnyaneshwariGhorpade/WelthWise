const { Router } = require('express');
const authMiddleware = require('../../middleware/auth.middleware');
const dashboardCtrl = require('./controller');

const router = Router();

router.use(authMiddleware);

router.get('/summary', dashboardCtrl.summary);
router.get('/trends', dashboardCtrl.trends);
router.get('/insights', dashboardCtrl.insights);

module.exports = router;