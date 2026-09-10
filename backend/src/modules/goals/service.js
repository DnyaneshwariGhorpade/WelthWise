const { pool } = require('../../config/db');
const { ApiError } = require('../../common/errors');
const { getAggregates } = require('../../common/finance.util');
const { insertInsight } = require('../../common/recalculate.service');

const STATUS = ['ACTIVE', 'COMPLETED', 'ARCHIVED'];
const RESOLUTION = ['ACCEPTED', 'MODIFIED', 'DISMISSED'];

function monthsBetween(from, to) {
  return Math.max(1, (new Date(to) - new Date(from)) / (1000 * 60 * 60 * 24 * 30.44));
}

async function listGoals(userId) {
  const result = await pool.query(
    `SELECT * FROM financial_goals WHERE user_id = $1 ORDER BY status = 'ACTIVE' DESC, priority ASC, target_date ASC`,
    [userId]
  );
  return result.rows.map((g) => ({
    id: g.goal_id,
    name: g.goal_name,
    targetAmount: Number(g.target_amount),
    currentAmount: Number(g.current_amount),
    targetDate: g.target_date,
    priority: g.priority,
    status: g.status,
    progress: g.target_amount > 0 ? Math.min(100, (g.current_amount / g.target_amount) * 100) : 0,
  }));
}

async function createGoal(userId, body) {
  const { goal_name, target_amount, target_date, priority = 3, current_amount = 0 } = body;
  const result = await pool.query(
    `INSERT INTO financial_goals (user_id, goal_name, target_amount, target_date, priority, current_amount)
     VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
    [userId, goal_name, target_amount, target_date || null, priority, current_amount]
  );
  await detectAndStoreConflicts(userId);
  const g = result.rows[0];
  return {
    id: g.goal_id,
    name: g.goal_name,
    targetAmount: Number(g.target_amount),
    currentAmount: Number(g.current_amount),
    targetDate: g.target_date,
    priority: g.priority,
    status: g.status,
  };
}

async function updateGoal(userId, id, body) {
  const result = await pool.query(
    `UPDATE financial_goals SET goal_name = COALESCE($3, goal_name),
      target_amount = COALESCE($4, target_amount),
      current_amount = COALESCE($5, current_amount),
      target_date = COALESCE($6, target_date),
      priority = COALESCE($7, priority),
      status = COALESCE($8, status),
      updated_at = CURRENT_TIMESTAMP
     WHERE user_id = $1 AND goal_id = $2 RETURNING *`,
    [userId, id, body.goal_name, body.target_amount, body.current_amount, body.target_date, body.priority, body.status]
  );
  if (!result.rowCount) throw new ApiError(404, 'Goal not found');
  await detectAndStoreConflicts(userId);
  return result.rows[0];
}

async function deleteGoal(userId, id) {
  const result = await pool.query('DELETE FROM financial_goals WHERE user_id = $1 AND goal_id = $2', [userId, id]);
  if (!result.rowCount) throw new ApiError(404, 'Goal not found');
  await detectAndStoreConflicts(userId);
  return { deleted: id };
}

function rankGoals(goals) {
  return [...goals].sort((a, b) => {
    if (a.priority !== b.priority) return a.priority - b.priority;
    return new Date(a.target_date) - new Date(b.target_date);
  });
}

async function detectAndStoreConflicts(userId) {
  const agg = await getAggregates(userId);
  const capacity = agg.monthlyIncome - agg.monthlyExpense;

  const result = await pool.query(
    `SELECT goal_id, goal_name, target_amount, current_amount, target_date, priority
     FROM financial_goals WHERE user_id = $1 AND status = 'ACTIVE'`,
    [userId]
  );
  const active = result.rows;

  if (active.length < 2 || capacity <= 0) return [];

  const withNeed = active.map((g) => {
    const remaining = Math.max(0, Number(g.target_amount) - Number(g.current_amount));
    const m = g.target_date ? monthsBetween(new Date(), g.target_date) : 12;
    return { ...g, requiredMonthly: remaining / m, remainingMonths: m };
  });

  const totalRequired = withNeed.reduce((s, g) => s + g.requiredMonthly, 0);

  if (totalRequired <= capacity * 0.9) return [];

  const involved = rankGoals(withNeed).slice(0, 2);
  const recommendedPlan = involved.map((g) => ({
    goalId: g.goal_id,
    name: g.goal_name,
    suggestion: `Either extend this goal's timeline or reduce its target by ~${Math.round(g.requiredMonthly * 12)} to fit within monthly capacity of ${Math.round(capacity * 100) / 100}.`,
  }));

  const existing = await pool.query(
    `SELECT conflict_id FROM goal_conflicts
     WHERE user_id = $1 AND resolution_status = 'PENDING' AND goal_ids_involved = $2`,
    [userId, JSON.stringify(involved.map((g) => g.goal_id))]
  );

  if (existing.rows.length) return [];

  const insert = await pool.query(
    `INSERT INTO goal_conflicts (user_id, goal_ids_involved, recommended_plan, resolution_status)
     VALUES ($1, $2, $3, 'PENDING') RETURNING *`,
    [userId, JSON.stringify(involved.map((g) => g.goal_id)), JSON.stringify(recommendedPlan)]
  );

  await insertInsight(
    userId,
    'GOAL_CONFLICT',
    'Two of your active goals are competing for the same monthly savings — see the Goals screen to resolve the conflict.'
  );

  return insert.rows;
}

async function listConflicts(userId) {
  const result = await pool.query(
    `SELECT conflict_id, goal_ids_involved, recommended_plan, resolution_status, detected_at
     FROM goal_conflicts WHERE user_id = $1 ORDER BY detected_at DESC`,
    [userId]
  );
  return result.rows.map((c) => ({
    id: c.conflict_id,
    goalIds: c.goal_ids_involved,
    recommendedPlan: c.recommended_plan,
    resolutionStatus: c.resolution_status,
    detectedAt: c.detected_at,
  }));
}

async function resolveConflict(userId, id, action) {
  if (!RESOLUTION.includes(action)) throw new ApiError(422, 'Action must be one of: ' + RESOLUTION.join(', '));
  const result = await pool.query(
    `UPDATE goal_conflicts SET resolution_status = $3 WHERE user_id = $1 AND conflict_id = $2 RETURNING *`,
    [userId, id, action]
  );
  if (!result.rowCount) throw new ApiError(404, 'Conflict not found');
  return {
    id: result.rows[0].conflict_id,
    resolutionStatus: result.rows[0].resolution_status,
  };
}

function extractNumber(text) {
  const match = text.replace(/,/g, '').match(/\$\s?([\d.]+)|(\d[\d.,]*(?:\.\d+)?)/);
  return match ? parseFloat((match[1] || match[2]).replace(/,/g, '')) : null;
}

async function evaluateDecision(userId, decisionDescription) {
  const agg = await getAggregates(userId);
  const capacity = agg.monthlyIncome - agg.monthlyExpense;

  const pending = await pool.query(
    'SELECT COUNT(*)::int AS n FROM goal_conflicts WHERE user_id = $1 AND resolution_status = \'PENDING\'',
    [userId]
  );

  const cost = extractNumber(decisionDescription);
  const goalsResult = await pool.query(
    'SELECT COUNT(*)::int AS n FROM financial_goals WHERE user_id = $1 AND status = \'ACTIVE\'',
    [userId]
  );

  let verdict = 'ADVISABLE';
  let reasoning;

  if (agg.monthlyIncome <= 0) {
    verdict = 'CAUTION';
    reasoning = 'You have no recorded income, so any large financial commitment carries high risk until your income situation is confirmed.';
  } else if (cost !== null && cost > capacity * 12) {
    verdict = 'NOT_ADVISABLE';
    reasoning = `Estimated cost (${cost.toLocaleString()}) exceeds a full year of your monthly surplus (${(capacity * 12).toLocaleString()}), which would put your savings goals at serious risk.`;
  } else if (cost !== null && cost > capacity * 3) {
    verdict = 'CAUTION';
    reasoning = `Estimated cost (${cost.toLocaleString()}) would consume more than three months of your surplus (${(capacity * 3).toLocaleString()}). Proceed only with a concrete repayment plan.`;
  } else if (pending.rows[0].n > 0) {
    verdict = 'CAUTION';
    reasoning = 'You have unresolved goal conflicts that already strain your budget; acting on this decision now could compound the problem.';
  } else if (cost !== null && agg.totalLiabilities > 0 && agg.totalLiabilities > agg.netWorth) {
    verdict = 'CAUTION';
    reasoning = 'Your liabilities currently exceed your net worth, so new spending should be deferred until your balance sheet improves.';
  } else {
    reasoning = `Based on a typical monthly surplus of ${(capacity * 100 / 100).toFixed(2)}, this decision fits within your current budget and does not threaten your ${goalsResult.rows[0].n || 0} active goal(s).`;
  }

  const snapshot = {
    monthlyIncome: Math.round(agg.monthlyIncome * 100) / 100,
    monthlyExpense: Math.round(agg.monthlyExpense * 100) / 100,
    netWorth: Math.round(agg.netWorth * 100) / 100,
    liabilities: Math.round(agg.totalLiabilities * 100) / 100,
    activeGoals: goalsResult.rows[0].n,
    pendingConflicts: pending.rows[0].n,
    estimatedCost: cost,
  };

  const result = await pool.query(
    `INSERT INTO decision_evaluations (user_id, decision_description, ai_verdict, ai_reasoning, source_data_snapshot)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [userId, decisionDescription, verdict, reasoning, JSON.stringify(snapshot)]
  );

  return {
    id: result.rows[0].evaluation_id,
    verdict,
    reasoning,
    snapshot,
  };
}

module.exports = {
  listGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  listConflicts,
  resolveConflict,
  evaluateDecision,
  detectAndStoreConflicts,
  STATUS,
  RESOLUTION,
};