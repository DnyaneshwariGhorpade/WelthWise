const cron = require('node-cron');

// Re-runs stress tests & goal-conflict detection whenever source financial
// data changes materially (BR-03, BR-05).
function startRecalculationJob() {
  cron.schedule('*/5 * * * *', () => {
    console.log('Recalculation job tick (BR-03 / BR-05) — not yet implemented.');
  });
}

module.exports = { startRecalculationJob };