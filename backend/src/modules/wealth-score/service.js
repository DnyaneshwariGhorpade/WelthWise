const { pool } = require('../../config/db');
const { ApiError } = require('../../common/errors');
const { getAggregates, clamp01, fmt } = require('../../common/finance.util');

function computeScore(agg) {
  const savings = Math.round(25 + 75 * clamp01(Math.max(0, agg.savingsRate) / 0.5));
  const debtRatio = agg.totalAssets > 0 ? agg.totalLiabilities / agg.totalAssets : agg.totalLiabilities > 0 ? 1.5 : 0;
  const debt = Math.round(100 - clamp01(debtRatio / 1.5) * 100);
  const liquidity = Math.round(Math.min(100, 10 + agg.emergencyMonths * 10));
  const investBase = agg.netWorth !== 0 ? agg.totalInvestments / Math.max(Math.abs(agg.netWorth), 1) : agg.monthlyIncome > 0 ? 2 : 0;
  const growth = Math.round(15 + clamp01(investBase) * 70);

  const overall = Math.round(savings * 0.3 + debt * 0.25 + liquidity * 0.25 + growth * 0.2);

  return { overall, savings, debt, liquidity, growth, explanation: buildExplanation(agg, { savings, debt, liquidity, growth }) };
}

function buildExplanation(agg, sub) {
  const parts = [];
  const savingsPct = agg.monthlyIncome > 0 ? (agg.savingsRate * 100) : null;
  if (savingsPct !== null && savingsPct >= 15) parts.push(`Your savings rate of ${fmt(savingsPct)}% is solid and supports a healthy score.`);
  else if (savingsPct !== null) parts.push(`Your savings rate of ${fmt(savingsPct)}% is below the recommended 15-20%, weighing on your score.`);
  else parts.push('You have no recorded income yet, which limits your savings capacity.');

  if (agg.totalLiabilities > 0 && agg.totalLiabilities > agg.totalAssets) parts.push('Your liabilities exceed your assets, which is pulling your debt sub-score down.');
  else if (agg.totalLiabilities > 0) parts.push(`Your debt level (${fmt(agg.totalLiabilities)}) is managed relative to your assets.`);
  else parts.push('You have no outstanding liabilities — a strong debt position.');

  if (agg.emergencyMonths < 3) parts.push(`Your emergency fund covers about ${fmt(agg.emergencyMonths)} months of expenses; aim for at least 3-6 months.`);
  else if (agg.emergencyMonths < 6) parts.push(`Your liquid reserves cover ${fmt(agg.emergencyMonths)} months of expenses, which is acceptable but could be strengthened.`);
  else parts.push(`Your emergency fund covers ${fmt(agg.emergencyMonths)} months of expenses — a strong liquidity buffer.`);

  if (agg.totalInvestments <= 0) parts.push('Building an investment portfolio would improve your growth sub-score and long-term wealth.');
  else parts.push(`Your investment portfolio (${fmt(agg.totalInvestments)}) contributes positively to growth.`);

  const weakness = sub.savings <= sub.debt && sub.savings <= sub.liquidity && sub.savings <= sub.growth
    ? 'savings behavior'
    : sub.debt <= sub.liquidity && sub.debt <= sub.growth
    ? 'debt management'
    : sub.liquidity <= sub.growth
    ? 'liquidity buffer'
    : 'growth / investing';

  parts.push(`Focus on your ${weakness} to raise your overall score next.`);
  return parts.join(' ');
}

async function getLatest(userId) {
  const result = await pool.query(
    `SELECT score_id, overall_score, savings_subscore, debt_subscore, liquidity_subscore, growth_subscore, ai_explanation, calculated_at
     FROM wealth_scores WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT 1`,
    [userId]
  );
  if (!result.rows.length) return null;
  const r = result.rows[0];
  return {
    id: r.score_id,
    overall: r.overall_score,
    savings: r.savings_subscore,
    debt: r.debt_subscore,
    liquidity: r.liquidity_subscore,
    growth: r.growth_subscore,
    explanation: r.ai_explanation,
    calculatedAt: r.calculated_at,
  };
}

async function getHistory(userId, limit = 12) {
  const result = await pool.query(
    `SELECT overall_score, calculated_at FROM wealth_scores
     WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map((r) => ({ score: r.overall_score, date: r.calculated_at })).reverse();
}

async function explainLatest(userId) {
  const latest = await getLatest(userId);
  if (!latest) throw new ApiError(404, 'No Wealth Score has been calculated yet');
  return { explanation: latest.explanation };
}

async function ensureFresh(userId) {
  const latest = await getLatest(userId);
  if (latest) return latest;
  const agg = await getAggregates(userId);
  const score = computeScore(agg);
  await pool.query(
    `INSERT INTO wealth_scores (user_id, overall_score, savings_subscore, debt_subscore, liquidity_subscore, growth_subscore, ai_explanation)
     VALUES ($1, $2, $3, $4, $5, $6, $7)`,
    [userId, score.overall, score.savings, score.debt, score.liquidity, score.growth, score.explanation]
  );
  return getLatest(userId);
}

module.exports = { computeScore, getLatest, getHistory, explainLatest, ensureFresh };