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

start();