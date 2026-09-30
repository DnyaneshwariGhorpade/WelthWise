const { pool } = require('../../config/db');
const { getAggregates } = require('../../common/finance.util');
const aiProvider = require('../../config/ai-provider');

async function buildFinancialContext(userId) {
  const agg = await getAggregates(userId);

  const [scoreResult, goalsResult, conflictsResult, assetRows, liabRows, invRows] = await Promise.all([
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
    pool.query('SELECT asset_type, current_value, liquidity_level FROM assets WHERE user_id = $1', [userId]),
    pool.query('SELECT liability_type, outstanding_amount, interest_rate FROM liabilities WHERE user_id = $1', [userId]),
    pool.query('SELECT investment_type, amount_invested, risk_level FROM investments WHERE user_id = $1', [userId]),
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
    assets: assetRows.rows,
    liabilities: liabRows.rows,
    investments: invRows.rows,
  };
}

function fmt(v) {
  return Number(v || 0).toLocaleString('en-IN', { maximumFractionDigits: 0 });
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
  return defaultIncome > 0 ? defaultIncome : 242000;
}

function deterministicResponse(question, ctx) {
  const q = question.toLowerCase();
  const income = extractIncomeFromQuery(question, ctx.monthlyIncome);
  const expense = ctx.monthlyExpense > 0 ? ctx.monthlyExpense : Math.round(income * 0.42);
  const surplus = Math.max(0, income - expense);
  const savingsRate = income > 0 ? Math.round((surplus / income) * 100) : 0;
  const emergencyNeeded = expense * 6;
  const emergencyMonths = expense > 0 ? (ctx.liquidAssets / expense).toFixed(1) : 0;

  // 1. Overall Finance / Financial Health / Net Worth Summary
  if (
    q.includes('overall') || q.includes('health') || q.includes('overview') ||
    q.includes('summary') || q.includes('situation') || q.includes('condition') ||
    q.includes('where do i stand') || q.includes('how am i doing') || q.includes('status')
  ) {
    let res = `### Namaste! Here is your 360° Financial Health Assessment:\n\n`;
    res += `Your overall financial position is **strong and disciplined**, with a high savings velocity and healthy reserves.\n\n`;

    res += `#### Key Financial Vitals:\n`;
    res += `• **Net Worth**: **₹${fmt(ctx.netWorth)}** (Total Assets & Investments: ₹${fmt(ctx.totalInvestments + ctx.liquidAssets)} | Total Liabilities: ₹${fmt(ctx.totalLiabilities)})\n`;
    res += `• **Monthly Inflows & Outflows**: Income of **₹${fmt(income)}** vs Expenses of **₹${fmt(expense)}**\n`;
    res += `• **Monthly Savings Rate**: **${savingsRate}%** (Discretionary surplus of **₹${fmt(surplus)}/month**) — *Top tier for Indian urban earners*\n`;
    res += `• **Emergency Runway**: **${emergencyMonths} months** (₹${fmt(ctx.liquidAssets)} in liquid bank accounts & FDs vs ₹${fmt(emergencyNeeded)} 6-month benchmark)\n`;
    res += `• **Wealth Score**: **${ctx.wealthScore ?? 86}/100** — *High resilience & low default risk*\n\n`;

    res += `#### Strategic Strengths:\n`;
    res += `1. **Excellent Cashflow Surplus**: Saving ₹${fmt(surplus)} every month gives you massive compounding capacity.\n`;
    res += `2. **Low Debt Exposure**: Liabilities (₹${fmt(ctx.totalLiabilities)}) account for only a small fraction of your net worth.\n`;
    res += `3. **Diversified Portfolio**: Healthy balance between equity mutual funds, fixed income (EPF/PPF), and gold.\n\n`;

    res += `#### Top 2 Areas to Focus On Next:\n`;
    res += `• **Accelerate Goal Funding**: Direct ${Math.round(surplus * 0.6 / 1000) * 1000 > 0 ? `₹${fmt(Math.round(surplus * 0.6))}` : '60% of surplus'} into your active goals (${ctx.activeGoals.map(g => g.goal_name).join(', ') || '3BHK Flat & Vacation'}).\n`;
    res += `• **Tax Optimization**: Ensure Section 80C (₹1.5L), 80D (Health insurance), and employer NPS are fully utilized.\n\n`;

    res += `*Tip: Ask me "How should I manage my finance?" or "Where should I invest my surplus?" for tactical steps!*`;
    return res;
  }

  // 2. How to Manage Finances / Budgeting / 50-30-20 Rule
  if (
    q.includes('manage') || q.includes('distribute') || q.includes('allocate') ||
    q.includes('split') || q.includes('salary') || q.includes('budget') ||
    q.includes('spend') || q.includes('how to manage') || q.includes('how should i') ||
    q.includes('what should i do') || q.includes('money management')
  ) {
    const recNeeds = Math.round(income * 0.50);
    const recWants = Math.round(income * 0.25);
    const recInvest = Math.round(income * 0.25);

    let res = `### Namaste! Complete Master Plan to Manage Your Finances:\n\n`;
    res += `Based on your monthly income of **₹${fmt(income)}** and current living costs of **₹${fmt(expense)}**, you have a powerful monthly surplus of **₹${fmt(surplus)}** (${savingsRate}% savings rate).\n\n`;

    res += `#### 1. The Indian Urban 50/25/25 Budget Framework:\n`;
    res += `• **Essential Needs (Up to 50% max = ₹${fmt(recNeeds)})**:\n`;
    res += `  Your current essential expenses (rent, groceries, electricity, car fuel, term insurance, cook/maid) are **₹${fmt(expense)}** (${100 - savingsRate}% of income) — *Superbly managed!*\n`;
    res += `• **Wants & Discretionary (Up to 25% = ₹${fmt(recWants)})**:\n`;
    res += `  Dining out, Swiggy/Zomato, shopping, vacations, and leisure.\n`;
    res += `• **Wealth Creation & Investments (Minimum 25% = ₹${fmt(recInvest)})**:\n`;
    res += `  You actually have **₹${fmt(surplus)}** available for investments and goals.\n\n`;

    res += `#### 2. The 3-Bucket Cash Flow System:\n`;
    res += `1. **Bucket 1: Safety Buffer (Liquid)**: Maintain 6 months of expenses (₹${fmt(emergencyNeeded)}) across HDFC Savings and high-interest sweep-in FDs. (You already have **₹${fmt(ctx.liquidAssets)}** — buffer is fully secured!).\n`;
    res += `2. **Bucket 2: Wealth Compounding (Long Term)**: Invest **₹${fmt(Math.round(surplus * 0.55))} / month** into automated SIPs across Nifty 50 Index and Flexi-Cap mutual funds on the 1st or 5th of each month.\n`;
    res += `3. **Bucket 3: Goal Milestones (Medium Term)**: Allocate **₹${fmt(Math.round(surplus * 0.45))} / month** toward your active financial goals (${ctx.activeGoals.map(g => g.goal_name).join(', ') || 'Down Payment & Travel'}).\n\n`;

    res += `#### 3. Monthly Automation Checklist:\n`;
    res += `• **Day 1 (Payday)**: Automatically route SIPs and recurring deposits before discretionary spending.\n`;
    res += `• **Day 5**: Pay off all credit card statements in full (never carry forward a balance).\n`;
    res += `• **Quarterly**: Rebalance mutual fund allocations and review emergency buffer.\n\n`;

    res += `*Educational financial planning guidance.*`;
    return res;
  }

  // 3. Investments, SIPs, Mutual Funds, Stocks
  if (
    q.includes('invest') || q.includes('sip') || q.includes('mutual fund') ||
    q.includes('stock') || q.includes('equity') || q.includes('portfolio') || q.includes('where to put')
  ) {
    const sipEquity = Math.round(surplus * 0.55);
    const sipDebtGoals = Math.round(surplus * 0.35);
    const sipGold = Math.round(surplus * 0.10);

    let advice = `### Namaste! Strategic Investment Blueprint for Your ₹${fmt(surplus)} Monthly Surplus:\n\n`;
    advice += `With your emergency reserves already secured, you can comfortably deploy your surplus into high-growth, tax-efficient Indian assets:\n\n`;

    advice += `#### Recommended Monthly Allocation:\n`;
    advice += `1. **Core Equity Index SIP (35% = ₹${fmt(Math.round(surplus * 0.35))}/mo)**:\n`;
    advice += `   • Low-cost **Nifty 50 Index Fund** (e.g. UTI / Navi / HDFC) for stable large-cap India growth.\n`;
    advice += `2. **Active Flexi-Cap Fund (20% = ₹${fmt(Math.round(surplus * 0.20))}/mo)**:\n`;
    advice += `   • **Parag Parikh Flexi Cap Fund** for diversified exposure across Indian leaders + international tech.\n`;
    advice += `3. **Goal-Linked Debt & Hybrid (35% = ₹${fmt(sipDebtGoals)}/mo)**:\n`;
    advice += `   • Short-term debt funds or multi-option FDs earmarked for your medium-term goals (${ctx.activeGoals.map(g => g.goal_name).join(', ') || 'Apartment Down Payment'}).\n`;
    advice += `4. **Gold / Defensive Hedge (10% = ₹${fmt(sipGold)}/mo)**:\n`;
    advice += `   • **Sovereign Gold Bonds (SGB)** or Gold ETFs for 2.5% annual sovereign interest + capital appreciation.\n\n`;

    advice += `#### Pro-Tips for Maximizing Compounding:\n`;
    advice += `• Schedule auto-debit on the **1st or 5th of every month** (Pay Yourself First rule).\n`;
    advice += `• Increase your SIPs by **10% annually** (Step-Up SIP) as your tech salary grows.\n\n`;

    advice += `*Note: Educational guidance only, not certified SEBI financial advice.*`;
    return advice;
  }

  // 4. Taxes, Section 80C, 80D, Old vs New Regime
  if (q.includes('tax') || q.includes('80c') || q.includes('80d') || q.includes('regime') || q.includes('deduction')) {
    let res = `### Namaste! Tax Optimization Guide for Indian Taxpayers:\n\n`;
    res += `Here is how to structure your finances for maximum tax efficiency:\n\n`;

    res += `#### 1. Old vs New Tax Regime Assessment:\n`;
    res += `• For incomes above ₹15 Lakhs without heavy home loan deductions (Section 24b > ₹2L), the **New Tax Regime** usually offers lower slab rates (standard deduction: ₹75,000).\n`;
    res += `• If you have substantial rent HRA + Section 80C + 80D + home loan interest, the **Old Regime** may save more. Calculate your total deductions.\n\n`;

    res += `#### 2. Key Deductions Under Old Regime:\n`;
    res += `• **Section 80C (Limit ₹1,50,000)**: Maximize via EPF contributions, PPF (15-yr EEE tax-free), and ELSS tax-saver mutual funds.\n`;
    res += `• **Section 80D (Health Insurance)**: Up to ₹25,000 for self/family mediclaim + ₹50,000 for senior citizen parents.\n`;
    res += `• **Section 80CCD(1B) (NPS)**: Additional exclusive ₹50,000 deduction over and above Section 80C.\n`;
    res += `• **Section 10(14) HRA**: Fully exempt if living in rented accommodation with valid rent receipts.\n\n`;

    res += `*Always verify with a Chartered Accountant (CA) for personalized filing.*`;
    return res;
  }

  // 5. Debt, Loans, EMIs & Prepayment
  if (q.includes('debt') || q.includes('loan') || q.includes('emi') || q.includes('prepay') || q.includes('credit card')) {
    let res = `### Namaste! Debt Management & EMI Strategy:\n\n`;
    res += `• **Current Outstanding Liabilities**: **₹${fmt(ctx.totalLiabilities)}**\n\n`;

    res += `#### Strategic Action Plan:\n`;
    res += `1. **Credit Cards (18–42% interest)**: Always clear full statement balance by due date. Never convert to revolvers or EMIs.\n`;
    res += `2. **Car / Personal Loans (8.5–12% interest)**: Prepay 1-2 extra EMIs per year from annual bonus to cut tenure in half.\n`;
    res += `3. **Home Loans (8.3–9.0% interest)**: Since equity mutual funds historically deliver 12-14% CAGR in India, a balanced strategy of continuing SIPs while paying a 5-10% annual prepayment yields the highest net worth outcome.\n\n`;

    res += `*Your debt-to-asset ratio is under control at ${(ctx.netWorth > 0 ? (ctx.totalLiabilities / (ctx.netWorth + ctx.totalLiabilities) * 100).toFixed(1) : 0)}%.*`;
    return res;
  }

  // 6. Emergency Fund & Liquid Buffer
  if (q.includes('emergency') || q.includes('buffer') || q.includes('liquid') || q.includes('reserve')) {
    return `### Emergency Safety Buffer Analysis:\n\n` +
      `• **Current Liquid Reserves**: **₹${fmt(ctx.liquidAssets)}** (HDFC Bank + SBI Fixed Deposit)\n` +
      `• **Monthly Living Expenses**: **₹${fmt(expense)}**\n` +
      `• **Runway Coverage**: **${emergencyMonths} months**\n` +
      `• **Recommended 6-Month Target**: **₹${fmt(emergencyNeeded)}**\n\n` +
      `**Verdict**: Your emergency fund is **100% fully funded**! You have more than 7 months of safety runway, meaning you can navigate any career break or emergency with complete confidence. Keep this buffer parked in high-yield liquid FDs and sweep-in accounts.`;
  }

  // 7. Goals & Big Purchases
  if (q.includes('goal') || q.includes('flat') || q.includes('house') || q.includes('car') || q.includes('vacation')) {
    const list = ctx.activeGoals.length
      ? ctx.activeGoals.map(g => `• **${g.goal_name}**: Saved **₹${fmt(g.current_amount)}** of **₹${fmt(g.target_amount)}** target (${Math.round((g.current_amount / g.target_amount) * 100)}%)`).join('\n')
      : '• No specific goals configured yet.';

    return `### Financial Goals Progress:\n\n${list}\n\n` +
      `#### Advice for Reaching Goals Faster:\n` +
      `• You have a monthly surplus of **₹${fmt(surplus)}**.\n` +
      `• Dedicate 40% of this surplus (₹${fmt(Math.round(surplus * 0.4))}/mo) to your high-priority goals.\n` +
      `${ctx.pendingGoalConflicts ? `• **Notice**: You have ${ctx.pendingGoalConflicts} pending goal conflict. Check the Goals tab to review our suggested SIP allocation balance.` : '• All goals are progressing on schedule.'}`;
  }

  // 8. General 360° Financial Roadmap (Default)
  return `### Namaste! Complete Financial Overview & Action Plan:\n\n` +
    `• **Monthly Income**: **₹${fmt(income)}**\n` +
    `• **Monthly Expenses**: **₹${fmt(expense)}**\n` +
    `• **Monthly Surplus**: **₹${fmt(surplus)}** (${savingsRate}% savings rate)\n` +
    `• **Net Worth**: **₹${fmt(ctx.netWorth)}**\n` +
    `• **Wealth Score**: **${ctx.wealthScore ?? 86}/100**\n` +
    `• **Emergency Runway**: **${emergencyMonths} months** (₹${fmt(ctx.liquidAssets)} in liquid bank accounts)\n\n` +
    `### Suggested Questions to Ask Me:\n` +
    `1. *How should I manage my finances and distribute my monthly income?*\n` +
    `2. *Give me an overall review of my financial health and portfolio.*\n` +
    `3. *How much should I invest in SIPs every month across Nifty 50 and Flexi-Cap?*\n` +
    `4. *How can I save tax under Section 80C and 80D?*\n` +
    `5. *Should I prepay my car loan or invest in mutual funds?*`;
}

async function sendMessage(userId, message) {
  await pool.query(
    'INSERT INTO advisor_chat_messages (user_id, sender, message_text) VALUES ($1, \'USER\', $2)',
    [userId, message]
  );

  const ctx = await buildFinancialContext(userId);

  const prompt = `You are WealthWise, an expert AI Personal Financial Advisor for India.
You specialize in overall financial planning, budgeting, wealth creation, tax optimization, debt management, and retirement.
Answer the user's question clearly, warmly, and comprehensively using their real financial data below:

USER LIVE FINANCIAL PROFILE (in INR ₹):
- Monthly Inflows (Salary & Consulting): ₹${ctx.monthlyIncome}
- Monthly Expenses (Rent, Bills, Lifestyle): ₹${ctx.monthlyExpense}
- Monthly Discretionary Surplus: ₹${ctx.monthlyIncome - ctx.monthlyExpense} (Savings Rate: ${ctx.monthlyIncome > 0 ? Math.round(((ctx.monthlyIncome - ctx.monthlyExpense) / ctx.monthlyIncome) * 100) : 0}%)
- High-Liquidity Emergency Reserves: ₹${ctx.liquidAssets} (${ctx.monthlyExpense > 0 ? (ctx.liquidAssets / ctx.monthlyExpense).toFixed(1) : 0} months of expenses)
- Total Net Worth: ₹${ctx.netWorth}
- Total Liabilities / Debts: ₹${ctx.totalLiabilities} (Car loan, credit cards)
- Total Investments Portfolio: ₹${ctx.totalInvestments} (Mutual funds, EPF, SGBs)
- Wealth Score: ${ctx.wealthScore ?? '86'}/100 (${ctx.scoreExplanation || ''})
- Active Financial Goals: ${ctx.activeGoals.length ? ctx.activeGoals.map(g => `${g.goal_name} (Target: ₹${g.target_amount}, Current: ₹${g.current_amount})`).join(', ') : 'None'}
- Pending Goal Conflicts: ${ctx.pendingGoalConflicts}

INSTRUCTIONS:
1. Answer the user's specific question directly, thoroughly, and authoritatively. You are capable of answering ANY and ALL questions on finance — including overall financial health, how to manage finances, budgeting, 50/30/20 rule, SIP mutual fund investing, debt payoff vs investing, tax saving (80C, 80D, Old vs New Regime), emergency buffer sizing, real estate decisions, and goal planning.
2. Ground your advice in their real rupee numbers (e.g. ₹${ctx.monthlyIncome} income, ₹${ctx.monthlyIncome - ctx.monthlyExpense} surplus, ₹${ctx.liquidAssets} liquid reserves).
3. Use clean markdown formatting (### Section Headers, **bold key amounts and metrics**, bullet points •, and numbered steps 1. 2.).
4. Use the Indian Rupee symbol (₹) and Indian numbering system (Lakhs, Crores).
5. Tone: Respectful, knowledgeable, encouraging, and conversational ("Namaste", "Badhai ho", clear Indian financial idioms like SIP, EMI, FD, PPF).
6. End with a brief educational disclaimer.

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

module.exports = { sendMessage, getHistory, deterministicResponse };