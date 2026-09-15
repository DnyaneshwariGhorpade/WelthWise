const { Router } = require('express');
const publicCtrl = require('./controller');

const router = Router();

router.get('/highlights', publicCtrl.getHighlights);

module.exports = router;
