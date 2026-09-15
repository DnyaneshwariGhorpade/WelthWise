const { pool } = require('../../config/db');
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
  return (v || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });
}

function extractIncomeFromQuery(question, defaultIncome) {
  if (defaultIncome > 0) return defaultIncome;
  const matches = question.match(/(?:₹|rs\.?|inr)?\s*(\d{1,3}(?:,\d{2,3})+|\d{4,7})/gi);
  if (matches) {
    for (const m of matches) {
      const num = parseInt(m.replace(/[^\d]/g, ''), 10);
      if (num >= 5000 && num <= 5000000) return num;
    }
  }
  return defaultIncome > 0 ? defaultIncome : 100000;
}

function deterministicResponse(question, ctx) {
  const q = question.toLowerCase();
  const income = extractIncomeFromQuery(question, ctx.monthlyIncome);
  const expense = ctx.monthlyExpense > 0 ? ctx.monthlyExpense : Math.round(income * 0.21);
  const surplus = Math.max(0, income - expense);
  const emergencyNeeded = expense * 6;
  const emergencyShortfall = Math.max(0, emergencyNeeded - ctx.liquidAssets);

  // 1. Money Distribution / Management / Budget Breakdown / 50-30-20 Rule
  if (
    q.includes('manage') || q.includes('distribute') || q.includes('allocate') ||
    q.includes('split') || q.includes('salary') || q.includes('budget') ||
    q.includes('spend') || q.includes('expense') || q.includes('save') ||
    q.includes('how should i') || q.includes('what should i do')
  ) {
    const recNeeds = Math.round(income * 0.5);
    const recWants = Math.round(income * 0.3);
    const recInvest = Math.round(income * 0.2);

    let res = `Based on your monthly income of **₹${fmt(income)}** and current monthly expenses of **₹${fmt(expense)}**, here is the optimal step-by-step strategy to manage and distribute your money:\n\n`;

    res += `### 1. The Ideal 50/30/20 Money Distribution:\n`;
    res += `• **Needs & Essential Expenses (50% max)**: Allocate up to **₹${fmt(recNeeds)}** for rent, utility bills, groceries, and debt payments. (Your current expenses are **₹${fmt(expense)}**, which is ${income > 0 ? Math.round((expense / income) * 100) : 0}% of income — great job keeping this under control!).\n`;
    res += `• **Wants & Lifestyle (30% max)**: Reserve up to **₹${fmt(recWants)}** for dining out, shopping, hobbies, and entertainment.\n`;
    res += `• **Savings & Investments (20% min)**: Direct at least **₹${fmt(recInvest)}** up to **₹${fmt(surplus)}** (your full monthly surplus) toward long-term wealth building.\n\n`;

    res += `### 2. Recommended Action Plan for Your ₹${fmt(surplus)} Monthly Surplus:\n`;
    res += `1. **Emergency Buffer**: Build a 3 to 6-month buffer (**₹${fmt(expense * 3)} – ₹${fmt(emergencyNeeded)}**) in high-yield liquid savings. Current liquid reserves: **₹${fmt(ctx.liquidAssets)}**.\n`;
    res += `2. **Systematic Investment Plan (SIP)**: Start an auto-debit monthly SIP of **₹${fmt(Math.round(surplus * 0.3))} – ₹${fmt(Math.round(surplus * 0.5))}** in diversified Nifty 50 Index Funds or Flexi-Cap Mutual Funds.\n`;
    if (ctx.activeGoals.length) {
      res += `3. **Goal Alignment**: Allocate the remaining surplus toward your active goals (${ctx.activeGoals.map(g => g.goal_name).join(', ')}).\n`;
    }

    res += `\n*Note: This breakdown is provided for educational financial planning.*`;
    return res;
  }

  // 2. SIP & Mutual Fund Queries
  if (q.includes('sip') || q.includes('systematic') || q.includes('mutual fund') || q.includes('invest')) {
    const recSipMin = Math.round(surplus * 0.3);
    const recSipMax = Math.round(surplus * 0.5);

    let advice = `Based on your profile, you have a monthly income of **₹${fmt(income)}** and expenses of **₹${fmt(expense)}**, giving you a monthly surplus of **₹${fmt(surplus)}**.\n\n`;

    advice += `### Recommended SIP Plan:\n`;
    advice += `1. **Suggested Monthly SIP**: **₹${fmt(recSipMin)} – ₹${fmt(recSipMax)}** per month (30% to 50% of your surplus).\n`;
    advice += `2. **Action Steps**:\n`;
    advice += `• Keep 3-6 months of expenses (**₹${fmt(expense * 3)} – ₹${fmt(emergencyNeeded)}**) in liquid savings as an emergency buffer. Current liquid reserves: **₹${fmt(ctx.liquidAssets)}**.\n`;
    advice += `• Invest in low-cost Nifty 50 Index Funds and Flexi-Cap Mutual Funds.\n`;
    advice += `• Setup auto-debit SIP on the 1st or 5th of every month.\n\n`;

    if (ctx.activeGoals.length) {
      advice += `### Active Goals Alignment:\n`;
      advice += `• You have ${ctx.activeGoals.length} active goal(s) (${ctx.activeGoals.map(g => g.goal_name).join(', ')}). Align your investment horizon accordingly.\n`;
    }

    advice += `\n*Note: Educational guidance only, not licensed investment advice.*`;
    return advice;
  }

  // 3. Wealth Score & Health
  if (q.includes('score') || q.includes('drop') || q.includes('why') || q.includes('health')) {
    if (ctx.wealthScore !== null) {
      return `Your current Wealth Score is **${ctx.wealthScore}/100**.\n\n${ctx.scoreExplanation || 'Maintaining a low debt ratio, consistent savings, and regular investments will help increase your score further.'}`;
    }
    return 'You do not have a Wealth Score calculated yet. Add your income, expense, and asset records to generate your score.';
  }

  // 4. Net Worth & Assets
  if (q.includes('net worth') || q.includes('worth') || q.includes('asset') || q.includes('liability')) {
    return `Your estimated Net Worth is **₹${fmt(ctx.netWorth)}**.\n\n• **Total Assets / Investments**: ₹${fmt(ctx.totalInvestments + ctx.liquidAssets)}\n• **Total Liabilities / Debts**: ₹${fmt(ctx.totalLiabilities)}`;
  }

  // 5. Emergency Buffer
  if (q.includes('emergency') || q.includes('reserve') || q.includes('buffer')) {
    const monthsCovered = ctx.monthlyExpense > 0 ? Math.round((ctx.liquidAssets / ctx.monthlyExpense) * 10) / 10 : 0;
    return `### Emergency Buffer Overview:\n\n• **Current Liquid Reserves**: ₹${fmt(ctx.liquidAssets)}\n• **Monthly Expenses**: ₹${fmt(ctx.monthlyExpense)}\n• **Runway Coverage**: ${monthsCovered} months\n\nWe recommend a 6-month buffer of **₹${fmt(emergencyNeeded)}**. ${emergencyShortfall > 0 ? `You currently have a shortfall of **₹${fmt(emergencyShortfall)}**.` : 'Your emergency buffer is fully funded!'}`;
  }

  // 6. Goals
  if (q.includes('goal')) {
    if (ctx.activeGoals.length) {
      const list = ctx.activeGoals.map((g) => `• **${g.goal_name}**: ₹${fmt(g.current_amount)} saved of ₹${fmt(g.target_amount)} target`).join('\n');
      return `### Active Financial Goals (${ctx.activeGoals.length}):\n\n${list}\n\n${ctx.pendingGoalConflicts ? `You have ${ctx.pendingGoalConflicts} unresolved goal conflict(s). Check the Goals tab to adjust.` : 'Your goal progress is actively tracking.'}`;
    }
    return 'You have no active goals created yet. Visit the Goals section to set your financial milestones.';
  }

  // 7. Comprehensive Default Advisory
  return `### Financial Overview:\n\n` +
    `• **Monthly Income**: ₹${fmt(ctx.monthlyIncome)}\n` +
    `• **Monthly Expenses**: ₹${fmt(ctx.monthlyExpense)}\n` +
    `• **Monthly Surplus**: ₹${fmt(surplus)}\n` +
    `• **Wealth Score**: ${ctx.wealthScore ?? 'N/A'}/100\n\n` +
    `### Suggested Questions:\n` +
    `1. How should I distribute my ₹${fmt(ctx.monthlyIncome)} monthly income?\n` +
    `2. How much should I invest in an SIP every month?\n` +
    `3. How large should my emergency buffer be?`;
}

async function sendMessage(userId, message) {
  await pool.query(
    'INSERT INTO advisor_chat_messages (user_id, sender, message_text) VALUES ($1, \'USER\', $2)',
    [userId, message]
  );

  const ctx = await buildFinancialContext(userId);

  const prompt = `You are WealthWise, an expert AI Personal Financial Advisor.
Answer the user's question clearly, warmly, and comprehensively using their real numbers below:

USER FINANCIAL SNAPSHOT:
- Monthly Income: ₹${ctx.monthlyIncome}
- Monthly Expenses: ₹${ctx.monthlyExpense}
- Monthly Surplus: ₹${ctx.monthlyIncome - ctx.monthlyExpense}
- Liquid Emergency Savings: ₹${ctx.liquidAssets}
- Total Net Worth: ₹${ctx.netWorth}
- Total Debts/Liabilities: ₹${ctx.totalLiabilities}
- Total Investments: ₹${ctx.totalInvestments}
- Wealth Score: ${ctx.wealthScore ?? 'Not calculated'} (${ctx.scoreExplanation || ''})
- Active Goals: ${ctx.activeGoals.length ? ctx.activeGoals.map(g => `${g.goal_name} (Target: ₹${g.target_amount}, Current: ₹${g.current_amount})`).join(', ') : 'None'}

INSTRUCTIONS:
1. Answer the user's specific question directly with accurate financial advice and exact numbers calculated from their income (₹${ctx.monthlyIncome}) and surplus (₹${ctx.monthlyIncome - ctx.monthlyExpense}).
2. Use markdown formatting (**bold** for key amounts and numbers, ### for section titles, • for bullet points, 1. 2. for numbered steps).
3. If asked about money management or salary distribution, provide exact rupee breakdowns (e.g., 50/30/20 rule, emergency buffer, SIP allocation).
4. Keep the tone professional, encouraging, and helpful. Include a brief disclaimer at the end.

User Question: ${message}`;

  let reply;
  let usedAI = false;
  try {
    reply = await aiProvider.generateText(prompt);
    usedAI = true;
  } catch (err) {
    console.warn('[AI ADVISOR FALLBACK]:', err.message);
    reply = deterministicResponse(message, ctx);
  }

  const insert = await pool.query(
    `INSERT INTO advisor_chat_messages (user_id, sender, message_text) VALUES ($1, 'AI', $2) RETURNING message_id, created_at`,
    [userId, reply]
  );

  return {
    message: reply,
    messageId: insert.rows[0].message_id,
    createdAt: insert.rows[0].created_at ? new Date(insert.rows[0].created_at).toISOString() : new Date().toISOString(),
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
    createdAt: m.created_at ? new Date(m.created_at).toISOString() : new Date().toISOString(),
  })).reverse();
}

module.exports = { sendMessage, getHistory };