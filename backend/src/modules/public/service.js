const { pool } = require('../../config/db');

async function getPublicHighlights() {
  let userCount = 0;
  let scoresCalculated = 0;
  try {
    const userRes = await pool.query('SELECT COUNT(*)::int AS count FROM users');
    const scoreRes = await pool.query('SELECT COUNT(*)::int AS count FROM wealth_scores');
    userCount = userRes.rows[0]?.count || 0;
    scoresCalculated = scoreRes.rows[0]?.count || 0;
  } catch (err) {
    console.warn('Could not fetch aggregate counts for public highlights:', err.message);
  }

  return {
    heroTitle: 'Your AI-Powered Personal Wealth Planner',
    heroSubtitle: 'WealthWise analyzes your complete financial picture and delivers actionable insights to help you build, protect, and grow your wealth with confidence.',
    features: [
      {
        id: 'wealth-score',
        title: 'Wealth Score',
        description: 'Get a dynamic, AI-calculated score that tracks your overall financial health across savings, debt, liquidity, and growth.',
        icon: 'TrendingUp',
      },
      {
        id: 'stress-test',
        title: 'Stress Testing',
        description: 'Simulate job loss, medical emergency, or income drop to see exactly how long your finances can survive each scenario.',
        icon: 'AlertTriangle',
      },
      {
        id: 'goal-conflict',
        title: 'Goal Conflict Advisor',
        description: 'Detect when competing financial goals clash and receive AI-powered recommendations on how to resolve them.',
        icon: 'Target',
      },
    ],
    platformStats: {
      totalRegisteredUsers: userCount,
      scoresGenerated: scoresCalculated,
      securityStandard: 'AES-256 & JWT',
    },
    disclaimer: 'WealthWise uses artificial intelligence to generate financial insights, scores, and recommendations. This content is for informational and educational purposes only and does not constitute certified financial advice.',
  };
}

module.exports = { getPublicHighlights };
