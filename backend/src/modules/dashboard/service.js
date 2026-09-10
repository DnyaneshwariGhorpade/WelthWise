const { pool } = require('../../config/db');
const { getAggregates } = require('../../common/finance.util');

async function summary(userId) {
  const agg = await getAggregates(userId);

  const [scoreResult, goalsResult, conflictResult] = await Promise.all([
    pool.query(
      'SELECT overall_score FROM wealth_scores WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT 1',
      [userId]
    ),
    pool.query(
      "SELECT COUNT(*)::int AS n FROM financial_goals WHERE user_id = $1 AND status = 'ACTIVE'",
      [userId]
    ),
    pool.query(
      "SELECT COUNT(*)::int AS n FROM goal_conflicts WHERE user_id = $1 AND resolution_status = 'PENDING'",
      [userId]
    ),
  ]);

  return {
    netWorth: Math.round(agg.netWorth * 100) / 100,
    monthlyIncome: Math.round(agg.monthlyIncome * 100) / 100,
    monthlyExpense: Math.round(agg.monthlyExpense * 100) / 100,
    liquidAssets: Math.round(agg.liquidAssets * 100) / 100,
    wealthScore: scoreResult.rows[0]?.overall_score ?? null,
    activeGoals: goalsResult.rows[0].n,
    pendingConflicts: conflictResult.rows[0].n,
  };
}

async function trends(userId) {
  const snapshots = await pool.query(
    `SELECT monthly_income, monthly_expense, net_worth, taken_at FROM financial_snapshots
     WHERE user_id = $1 ORDER BY taken_at DESC LIMIT 12`,
    [userId]
  );
  const snapshotTrend = snapshots.rows
    .map((s) => ({
      date: s.taken_at,
      income: Number(s.monthly_income),
      expense: Number(s.monthly_expense),
      netWorth: Number(s.net_worth),
    }))
    .reverse();

  const scoreHistory = await pool.query(
    `SELECT overall_score, calculated_at FROM wealth_scores
     WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT 12`,
    [userId]
  );
  const scoreTrend = scoreHistory.rows
    .map((s) => ({ date: s.calculated_at, score: s.overall_score }))
    .reverse();

  return { snapshotTrend, scoreTrend };
}

async function insights(userId, limit = 6) {
  const result = await pool.query(
    `SELECT insight_id, insight_type, message, is_read, created_at FROM ai_insights
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map((i) => ({
    id: i.insight_id,
    type: i.insight_type,
    message: i.message,
    isRead: i.is_read,
    createdAt: i.created_at,
  }));
}

module.exports = { summary, trends, insights };