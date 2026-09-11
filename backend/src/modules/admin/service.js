const { pool } = require('../../config/db');
const { ApiError } = require('../../common/errors');

const VALID_PROVIDERS = ['openai', 'gemini'];

function maskKey(key) {
  if (!key) return null;
  if (key.length <= 8) return '****';
  return key.slice(0, 4) + '****' + key.slice(-4);
}

async function getUsageSummary() {
  const [
    totalUsers,
    activeUsers,
    userGrowth,
    recordCounts,
    recentScores,
    totalInsights,
    totalChatMessages,
    totalStressTests,
    totalDecisions,
  ] = await Promise.all([
    pool.query('SELECT COUNT(*)::int AS n FROM users'),
    pool.query(
      "SELECT COUNT(*)::int AS n FROM users WHERE last_login_at IS NOT NULL AND last_login_at >= NOW() - INTERVAL '15 minutes'"
    ),
    pool.query(
      `SELECT DATE_TRUNC('month', created_at) AS month, COUNT(*)::int AS count
       FROM users
       WHERE created_at >= NOW() - INTERVAL '12 months'
       GROUP BY DATE_TRUNC('month', created_at)
       ORDER BY month ASC`
    ),
    pool.query(`SELECT
      (SELECT COUNT(*)::int FROM incomes) AS incomes,
      (SELECT COUNT(*)::int FROM expenses) AS expenses,
      (SELECT COUNT(*)::int FROM assets) AS assets,
      (SELECT COUNT(*)::int FROM liabilities) AS liabilities,
      (SELECT COUNT(*)::int FROM investments) AS investments
    `),
    pool.query(
      "SELECT COUNT(*)::int AS n FROM wealth_scores WHERE calculated_at >= NOW() - INTERVAL '30 days'"
    ),
    pool.query('SELECT COUNT(*)::int AS n FROM ai_insights'),
    pool.query('SELECT COUNT(*)::int AS n FROM advisor_chat_messages'),
    pool.query('SELECT COUNT(*)::int AS n FROM stress_test_results'),
    pool.query('SELECT COUNT(*)::int AS n FROM decision_evaluations'),
  ]);

  return {
    totalUsers: totalUsers.rows[0].n,
    activeUsers: activeUsers.rows[0].n,
    userGrowth: userGrowth.rows.map((r) => ({
      month: r.month,
      count: r.count,
    })),
    recordCounts: {
      incomes: recordCounts.rows[0].incomes,
      expenses: recordCounts.rows[0].expenses,
      assets: recordCounts.rows[0].assets,
      liabilities: recordCounts.rows[0].liabilities,
      investments: recordCounts.rows[0].investments,
    },
    recentScoresCount: recentScores.rows[0].n,
    totalInsights: totalInsights.rows[0].n,
    totalChatMessages: totalChatMessages.rows[0].n,
    totalStressTests: totalStressTests.rows[0].n,
    totalDecisionEvaluations: totalDecisions.rows[0].n,
  };
}

async function getSystemStatus() {
  const checks = {};

  // Database check
  const dbStart = Date.now();
  try {
    await pool.query('SELECT 1');
    checks.database = { status: 'healthy', latencyMs: Date.now() - dbStart };
  } catch (err) {
    checks.database = { status: 'unhealthy', error: err.message };
  }

  // Redis check
  try {
    const { createClient } = require('redis');
    const client = createClient({
      url: process.env.REDIS_URL || 'redis://localhost:6379',
      socket: { connectTimeout: 2000 },
    });
    const redisStart = Date.now();
    await client.connect();
    await client.ping();
    await client.quit();
    checks.redis = { status: 'healthy', latencyMs: Date.now() - redisStart };
  } catch (err) {
    checks.redis = { status: 'unhealthy', error: err.message };
  }

  // AI provider check
  const currentProvider = process.env.AI_PROVIDER || 'openai';
  const keyEnvVar = currentProvider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
  const apiKey = process.env[keyEnvVar];
  checks.aiProvider = {
    provider: currentProvider,
    configured: !!apiKey,
    status: apiKey ? 'configured' : 'not_configured',
  };

  // Server uptime
  checks.serverUptime = Math.floor(process.uptime());

  return checks;
}

async function getAIConfig() {
  const currentProvider = process.env.AI_PROVIDER || 'openai';
  const openaiKey = process.env.OPENAI_API_KEY;
  const geminiKey = process.env.GEMINI_API_KEY;

  return {
    currentProvider,
    availableProviders: VALID_PROVIDERS.map((p) => {
      const keyEnvVar = p === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
      const key = process.env[keyEnvVar];
      return {
        name: p,
        apiKeyConfigured: !!key,
        apiKeyMasked: maskKey(key),
      };
    }),
    healthCheck: {
      provider: currentProvider,
      reachable: !!(currentProvider === 'gemini' ? geminiKey : openaiKey),
    },
  };
}

async function updateAIConfig(provider) {
  if (!VALID_PROVIDERS.includes(provider)) {
    throw new ApiError(422, `Invalid provider. Must be one of: ${VALID_PROVIDERS.join(', ')}`);
  }

  process.env.AI_PROVIDER = provider;

  const keyEnvVar = provider === 'gemini' ? 'GEMINI_API_KEY' : 'OPENAI_API_KEY';
  const apiKey = process.env[keyEnvVar];

  return {
    currentProvider: provider,
    apiKeyConfigured: !!apiKey,
    message: `AI provider switched to ${provider}`,
  };
}

async function getAuditLogs({ search, action, userId, page = 1, limit = 50 }) {
  const offset = (page - 1) * limit;
  const conditions = [];
  const params = [];
  let paramIdx = 1;

  if (search) {
    conditions.push(`(al.action ILIKE $${paramIdx} OR al.resource_type ILIKE $${paramIdx} OR u.email ILIKE $${paramIdx} OR u.full_name ILIKE $${paramIdx})`);
    params.push(`%${search}%`);
    paramIdx++;
  }

  if (action) {
    conditions.push(`al.action = $${paramIdx}`);
    params.push(action);
    paramIdx++;
  }

  if (userId) {
    conditions.push(`al.user_id = $${paramIdx}`);
    params.push(userId);
    paramIdx++;
  }

  const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const countResult = await pool.query(
    `SELECT COUNT(*)::int AS total FROM audit_logs al
     LEFT JOIN users u ON u.user_id = al.user_id
     ${whereClause}`,
    params
  );

  const logs = await pool.query(
    `SELECT al.log_id, al.user_id, COALESCE(u.full_name, 'System') AS actor_name,
            COALESCE(u.email, 'system') AS actor_email,
            al.action, al.resource_type, al.resource_id, al.ip_address, al.created_at
     FROM audit_logs al
     LEFT JOIN users u ON u.user_id = al.user_id
     ${whereClause}
     ORDER BY al.created_at DESC
     LIMIT $${paramIdx} OFFSET $${paramIdx + 1}`,
    [...params, limit, offset]
  );

  return {
    logs: logs.rows.map((r) => ({
      id: r.log_id,
      userId: r.user_id,
      actorName: r.actor_name,
      actorEmail: r.actor_email,
      action: r.action,
      resourceType: r.resource_type,
      resourceId: r.resource_id,
      ipAddress: r.ip_address,
      createdAt: r.created_at,
    })),
    pagination: {
      total: countResult.rows[0].total,
      page,
      limit,
      totalPages: Math.ceil(countResult.rows[0].total / limit),
    },
  };
}

async function exportAuditLogs({ search, action, userId, format = 'csv' }) {
  const result = await getAuditLogs({ search, action, userId, page: 1, limit: 10000 });

  if (format === 'json') {
    return { format: 'json', data: result.logs };
  }

  // CSV format
  const headers = ['ID', 'Actor Name', 'Actor Email', 'Action', 'Resource Type', 'Resource ID', 'IP Address', 'Timestamp'];
  const escape = (v) => {
    const s = String(v ?? '');
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const rows = result.logs.map((r) =>
    [r.id, r.actorName, r.actorEmail, r.action, r.resourceType, r.resourceId || '', r.ipAddress || '', r.createdAt].map(escape).join(',')
  );
  const csv = [headers.join(','), ...rows].join('\n');
  return { format: 'csv', data: csv };
}

module.exports = {
  getUsageSummary,
  getSystemStatus,
  getAIConfig,
  updateAIConfig,
  getAuditLogs,
  exportAuditLogs,
};
