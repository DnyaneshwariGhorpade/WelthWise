const { pool } = require('../../config/db');
const { ApiError } = require('../../common/errors');
const { getAggregates } = require('../../common/finance.util');

async function listScenarios() {
  const result = await pool.query(
    'SELECT scenario_id, name, description, income_impact_pct, expense_impact_pct FROM stress_test_scenarios ORDER BY scenario_id'
  );
  return result.rows;
}

async function getLatest(userId) {
  const result = await pool.query(
    `SELECT r.*, s.name AS scenario_name, s.description AS scenario_description
     FROM stress_test_results r
     JOIN stress_test_scenarios s ON s.scenario_id = r.scenario_id
     WHERE r.user_id = $1 ORDER BY r.run_at DESC LIMIT 1`,
    [userId]
  );
  if (!result.rows.length) return null;
  const r = result.rows[0];
  return {
    id: r.result_id,
    scenarioId: r.scenario_id,
    scenarioName: r.scenario_name,
    scenarioDescription: r.scenario_description,
    monthsOfRunway: Number(r.months_of_runway),
    weakestPoint: r.weakest_point,
    recommendation: r.ai_recommendation,
    isStale: r.is_stale,
    runAt: r.run_at,
  };
}

function fmt(v) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

function pickWeakPoint(agg, adjustedExpense, adjustedIncome) {
  const netUnderShock = adjustedIncome - adjustedExpense;
  if (netUnderShock < 0) return 'Recurring expenses exceed your income under this scenario, so you would burn through reserves every month.';
  if (agg.emergencyMonths < 3) return `Your emergency fund covers only about ${fmt(agg.emergencyMonths)} months of expenses — thinner than the recommended 3-6 months.`;
  if (agg.totalLiabilities > 0 && agg.totalLiabilities > agg.monthlyIncome * 12) return 'Outstanding liabilities exceed a full year of income, magnifying your exposure to payment pressure.';
  if (agg.liquidAssets <= 0) return 'You hold no high-liquidity assets to draw on when income drops.';
  return 'Your liquidity mix may be concentrated in assets that are hard to sell quickly during a downturn.';
}

function buildRecommendation(agg, scenario, monthsOfRunway) {
  const tips = [];
  if (monthsOfRunway < 3) tips.push('Build an emergency fund covering at least 3 months of expenses before taking on new commitments.');
  if (monthsOfRunway < 6) tips.push('Top up liquid, high-liquidity savings so your runway reaches 6+ months.');
  if (agg.monthlyExpense > agg.monthlyIncome) tips.push('Cut recurring expenses so your baseline budget is at or below your income.');
  if (agg.totalLiabilities > 0) tips.push(`Review your ${fmt(agg.totalLiabilities)} of debt — prioritise high-interest obligations to lower required payments.`);
  tips.push(`Scenario "${scenario.name}" reduces income by ${scenario.income_impact_pct}% and raises expenses by ${scenario.expense_impact_pct}% — stress-test again after every material change.`);
  return tips.join(' ');
}

async function runScenario(userId, scenarioId) {
  const scenarioResult = await pool.query(
    'SELECT * FROM stress_test_scenarios WHERE scenario_id = $1',
    [scenarioId]
  );
  if (!scenarioResult.rows.length) throw new ApiError(404, 'Stress scenario not found');
  const scenario = scenarioResult.rows[0];

  const agg = await getAggregates(userId);

  const adjustedIncome = agg.monthlyIncome * (1 - Number(scenario.income_impact_pct) / 100);
  const adjustedExpense = agg.monthlyExpense * (1 + Number(scenario.expense_impact_pct) / 100);
  const monthlyNet = adjustedIncome - adjustedExpense;
  const reserves = agg.liquidAssets;

  let monthsOfRunway;
  if (adjustedExpense <= 0) {
    monthsOfRunway = 999;
  } else if (monthlyNet >= 0) {
    monthsOfRunway = reserves > 0 ? 999 : 0;
  } else {
    monthsOfRunway = reserves <= 0 ? 0 : Math.round((reserves / Math.abs(monthlyNet)) * 10) / 10;
  }

  const weakestPoint = pickWeakPoint(agg, adjustedExpense, adjustedIncome);
  const recommendation = buildRecommendation(agg, scenario, monthsOfRunway);

  const result = await pool.query(
    `INSERT INTO stress_test_results (user_id, scenario_id, months_of_runway, weakest_point, ai_recommendation, is_stale)
     VALUES ($1, $2, $3, $4, $5, FALSE) RETURNING *`,
    [userId, scenarioId, monthsOfRunway, weakestPoint, recommendation]
  );

  return {
    id: result.rows[0].result_id,
    scenarioId,
    scenarioName: scenario.name,
    scenarioDescription: scenario.description,
    monthsOfRunway,
    weakestPoint,
    recommendation,
    isStale: false,
    runAt: result.rows[0].run_at,
  };
}

module.exports = { listScenarios, getLatest, runScenario };