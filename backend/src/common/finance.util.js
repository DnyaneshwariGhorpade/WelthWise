const { pool } = require('../config/db');

const FREQ_MULTIPLIER = { MONTHLY: 1, QUARTERLY: 1 / 3, YEARLY: 1 / 12 };

function clamp01(x) {
  return Math.max(0, Math.min(1, x));
}

function round(x) {
  return Math.round(x * 100) / 100;
}

function fmt(v) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 2 });
}

async function getAggregates(userId) {
  const [incomes, expenses, assets, liabilities, investments] = await Promise.all([
    pool.query('SELECT amount, frequency FROM incomes WHERE user_id = $1', [userId]),
    pool.query('SELECT amount, frequency FROM expenses WHERE user_id = $1', [userId]),
    pool.query('SELECT current_value, liquidity_level FROM assets WHERE user_id = $1', [userId]),
    pool.query('SELECT outstanding_amount FROM liabilities WHERE user_id = $1', [userId]),
    pool.query('SELECT amount_invested FROM investments WHERE user_id = $1', [userId]),
  ]);

  const monthlyIncome = incomes.rows.reduce((s, r) => s + Number(r.amount) * (FREQ_MULTIPLIER[r.frequency] || 1), 0);
  const monthlyExpense = expenses.rows.reduce((s, r) => s + Number(r.amount) * (FREQ_MULTIPLIER[r.frequency] || 1), 0);
  const totalAssets = assets.rows.reduce((s, r) => s + Number(r.current_value), 0);
  const totalLiabilities = liabilities.rows.reduce((s, r) => s + Number(r.outstanding_amount), 0);
  const liquidAssets = assets.rows
    .filter((a) => a.liquidity_level === 'HIGH')
    .reduce((s, r) => s + Number(r.current_value), 0);
  const totalInvestments = investments.rows.reduce((s, r) => s + Number(r.amount_invested), 0);

  return {
    monthlyIncome,
    monthlyExpense,
    totalAssets,
    totalLiabilities,
    liquidAssets,
    totalInvestments,
    netWorth: totalAssets - totalLiabilities,
    savingsRate: monthlyIncome > 0 ? (monthlyIncome - monthlyExpense) / monthlyIncome : monthlyIncome - monthlyExpense,
    emergencyMonths: monthlyExpense > 0 ? liquidAssets / monthlyExpense : 0,
  };
}

module.exports = { FREQ_MULTIPLIER, getAggregates, clamp01, round, fmt };