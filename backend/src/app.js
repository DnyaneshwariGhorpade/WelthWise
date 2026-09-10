const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./common/errors');
const { httpLogger } = require('./common/audit');

const app = express();

app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN || true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
  })
);

// API routers are mounted here as modules are implemented:
// app.use('/api/v1/auth', require('./modules/auth/routes'));
// app.use('/api/v1/finances', require('./modules/finances/routes'));
// app.use('/api/v1/wealth-score', require('./modules/wealth-score/routes'));
// app.use('/api/v1/stress-test', require('./modules/stress-test/routes'));
// app.use('/api/v1/goals', require('./modules/goals/routes'));
// app.use('/api/v1/advisor', require('./modules/advisor/routes'));
// app.use('/api/v1/dashboard', require('./modules/dashboard/routes'));

app.get('/health', (req, res) => res.status(200).json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;