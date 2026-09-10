const { pool } = require('../config/db');
const wealthScoreService = require('../modules/wealth-score/service');
const { getAggregates, round } = require('./finance.util');

async function insertInsight(userId, type, message) {
  await pool.query(
    `INSERT INTO ai_insights (user_id, insight_type, message) VALUES ($1, $2, $3)`,
    [userId, type, message]
  );
}

async function recalculateUser(userId) {
  const agg = await getAggregates(userId);

  const prev = await pool.query(
    'SELECT overall_score FROM wealth_scores WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT 1',
    [userId]
  );

  const score = wealthScoreService.computeScore(agg);

  await pool.query(
    `INSERT INTO wealth_scores (user_id, overall_score, savings_subscore, debt_subscore, liquidity_subscore, growth_subscore, ai_explanation)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, score.overall, score.savings, score.debt, score.liquidity, score.growth, score.explanation]
  );

  await pool.query(
    `INSERT INTO financial_snapshots (user_id, monthly_income, monthly_expense, net_worth)
     VALUES ($1, $2, $3, $4)`,
    [userId, round(agg.monthlyIncome), round(agg.monthlyExpense), round(agg.netWorth)]
  );

  await pool.query('UPDATE stress_test_results SET is_stale = TRUE WHERE user_id = $1', [userId]);

  if (prev.rows.length && prev.rows[0].overall_score !== null) {
    const delta = score.overall - prev.rows[0].overall_score;
    if (Math.abs(delta) >= 3) {
      const direction = delta > 0 ? 'rose' : 'dropped';
      await insertInsight(
        userId,
        'SCORE_CHANGE',
        `Your Wealth Score ${direction} from ${prev.rows[0].overall_score} to ${score.overall} (${delta > 0 ? '+' : ''}${delta}pts).`
      );
    }
  }

  const { detectAndStoreConflicts } = require('../modules/goals/service');
  try {
    await detectAndStoreConflicts(userId);
  } catch (err) {
    console.error('Conflict detection failed:', err.message);
  }
}

module.exports = { recalculateUser, insertInsight };