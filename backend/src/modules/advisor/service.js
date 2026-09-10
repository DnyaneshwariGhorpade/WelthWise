const { pool } = require('../../config/db');
const { ApiError } = require('../../common/errors');
const { getAggregates } = require('../../common/finance.util');
const aiProvider = require('../../config/ai-provider');

async function buildFinancialContext(userId) {
  const agg = await getAggregates(userId);

  const [scoreResult, goalsResult, conflictsResult] = await Promise.all([
    pool.query(
      'SELECT overall_score, ai_explanation FROM wealth_scores WHERE user_id = $1 ORDER BY calculated_at DESC LIMIT 1',
      [userId]
    ),
    pool.query(
      'SELECT goal_name, target_amount, current_amount, priority FROM financial_goals WHERE user_id = $1 AND status = \'ACTIVE\'',
      [userId]
    ),
    pool.query(
      'SELECT COUNT(*)::int AS n FROM goal_conflicts WHERE user_id = $1 AND resolution_status = \'PENDING\'',
      [userId]
    ),
  ]);

  return {
    monthlyIncome: Math.round(agg.monthlyIncome),
    monthlyExpense: Math.round(agg.monthlyExpense),
    netWorth: Math.round(agg.netWorth),
    liquidAssets: Math.round(agg.liquidAssets),
    totalLiabilities: Math.round(agg.totalLiabilities),
    totalInvestments: Math.round(agg.totalInvestments),
    wealthScore: scoreResult.rows[0]?.overall_score ?? null,
    scoreExplanation: scoreResult.rows[0]?.ai_explanation ?? null,
    activeGoals: goalsResult.rows,
    pendingGoalConflicts: conflictsResult.rows[0]?.n ?? 0,
  };
}

function fmt(v) {
  return v.toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function deterministicResponse(question, ctx) {
  const q = question.toLowerCase();

  if (q.includes('score') || q.includes('drop') || q.includes('why')) {
    if (ctx.wealthScore !== null) {
      return `Your current Wealth Score is ${ctx.wealthScore}/100. ${ctx.scoreExplanation || ''}`;
    }
    return 'You do not have a Wealth Score yet — add your financial records and it will be calculated automatically.';
  }
  if (q.includes('net worth') || q.includes('worth')) {
    return `Your estimated net worth is ${fmt(ctx.netWorth)} (assets minus liabilities, based on your latest records).`;
  }
  if (q.includes('spend') || q.includes('expense')) {
    return `Your average monthly expenses are ${fmt(ctx.monthlyExpense)} against monthly income of ${fmt(ctx.monthlyIncome)}, leaving a surplus of ${fmt(ctx.monthlyIncome - ctx.monthlyExpense)} per month.`;
  }
  if (q.includes('goal')) {
    if (ctx.activeGoals.length) {
      const list = ctx.activeGoals.map((g) => `${g.goal_name} (${fmt(g.current_amount)} / ${fmt(g.target_amount)})`).join('; ');
      return `You have ${ctx.activeGoals.length} active goal(s): ${list}.${ctx.pendingGoalConflicts ? ` Note: you have ${ctx.pendingGoalConflicts} unresolved conflict(s) that may need attention.` : ''}`;
    }
    return 'You have no active goals yet. Create one on the Goals screen to start tracking progress.';
  }
  if (q.includes('emergency') || q.includes('save') || q.includes('reserve')) {
    const months = ctx.monthlyExpense > 0 ? ctx.liquidAssets / ctx.monthlyExpense : 0;
    return `Your liquid reserves of ${fmt(ctx.liquidAssets)} cover roughly ${fmt(months)} months of expenses. Aim for 3-6 months as an emergency buffer.`;
  }
  if (q.includes('debt') || q.includes('liab')) {
    return `Your total outstanding liabilities are ${fmt(ctx.totalLiabilities)}, against assets of roughly ${fmt(ctx.netWorth + ctx.totalLiabilities)}.`;
  }
  if (q.includes('invest')) {
    return `Your total investment holdings are ${fmt(ctx.totalInvestments)}, contributing to the growth component of your Wealth Score.`;
  }

  return `I can only answer from the financial data you have stored in WealthWise. Your latest profile shows income of ${fmt(ctx.monthlyIncome)}/month, expenses of ${fmt(ctx.monthlyExpense)}/month, net worth of ${fmt(ctx.netWorth)}, and a Wealth Score of ${ctx.wealthScore ?? 'not yet calculated'}. Try asking about your score, spending, goals, or emergency buffer.`;
}

async function sendMessage(userId, message) {
  await pool.query(
    'INSERT INTO advisor_chat_messages (user_id, sender, message_text) VALUES ($1, \'USER\', $2)',
    [userId, message]
  );

  const ctx = await buildFinancialContext(userId);

  let reply;
  let usedAI = false;
  try {
    reply = await aiProvider.generateText(
      `You are the WealthWise financial advisor. Answer using ONLY this user's data:\n${JSON.stringify(ctx)}\n\nQuestion: ${message}`
    );
    usedAI = true;
  } catch (err) {
    reply = deterministicResponse(message, ctx);
  }

  const insert = await pool.query(
    `INSERT INTO advisor_chat_messages (user_id, sender, message_text) VALUES ($1, 'AI', $2) RETURNING message_id, created_at`,
    [userId, reply]
  );

  return {
    message: reply,
    messageId: insert.rows[0].message_id,
    createdAt: insert.rows[0].created_at,
    generatedByAI: usedAI,
  };
}

async function getHistory(userId, limit = 50) {
  const result = await pool.query(
    `SELECT message_id, sender, message_text, created_at FROM advisor_chat_messages
     WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2`,
    [userId, limit]
  );
  return result.rows.map((m) => ({
    id: m.message_id,
    sender: m.sender,
    text: m.message_text,
    createdAt: m.created_at,
  })).reverse();
}

module.exports = { sendMessage, getHistory };