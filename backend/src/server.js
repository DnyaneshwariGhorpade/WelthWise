const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
require('dotenv').config();
const app = require('./app');
const { pool } = require('./config/db');
const { startRecalculationJob } = require('./jobs/recalculate.job');

const PORT = process.env.PORT || 3000;

async function start() {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection verified.');
  } catch (err) {
    console.error('Database connection failed:', err.message);
  }

  startRecalculationJob();

  app.listen(PORT, () => {
    console.log(`WealthWise API listening on port ${PORT}`);
  });
}

process.on('uncaughtException', (err) => {
  console.warn('Process uncaughtException (prevented exit):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.warn('Process unhandledRejection (prevented exit):', reason);
});

start();