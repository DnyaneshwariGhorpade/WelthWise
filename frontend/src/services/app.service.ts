import api from './api';

export function apiErr(err: unknown, fallback = 'Something went wrong. Please try again.'): string {
  const e = err as { response?: { data?: { error?: unknown } }; message?: string };
  const data = e.response?.data;
  if (!data || typeof data !== 'object') return e.message || fallback;
  const error = (data as { error?: unknown }).error;
  if (typeof error === 'string') return error;
  if (error && typeof error === 'object') {
    const msg = (error as { message?: string }).message;
    if (msg) return msg;
  }
  if (typeof e.message === 'string' && e.message) return e.message;
  return fallback;
}

export type FinanceType = 'income' | 'expense' | 'asset' | 'liability' | 'investment';
export type Frequency = 'MONTHLY' | 'QUARTERLY' | 'YEARLY';
export type RiskLevel = 'LOW' | 'MEDIUM' | 'HIGH';
export type LiquidityLevel = 'HIGH' | 'MEDIUM' | 'LOW';

export interface DashboardSummary {
  netWorth: number;
  monthlyIncome: number;
  monthlyExpense: number;
  liquidAssets: number;
  wealthScore: number | null;
  activeGoals: number;
  pendingConflicts: number;
}

export interface TrendPoint {
  date: string;
  income: number;
  expense: number;
  netWorth: number;
}

export interface ScoreTrendPoint {
  date: string;
  score: number;
}

export interface DashboardTrends {
  snapshotTrend: TrendPoint[];
  scoreTrend: ScoreTrendPoint[];
}

export interface AiInsight {
  id: number;
  type: 'SCORE_CHANGE' | 'GOAL_CONFLICT' | 'STRESS_ALERT' | 'GENERAL';
  message: string;
  isRead: boolean;
  createdAt: string;
}

export interface WealthScore {
  id: number;
  overall: number;
  savings: number;
  debt: number;
  liquidity: number;
  growth: number;
  explanation: string | null;
  calculatedAt: string;
}

export interface WealthScoreHistoryPoint {
  score: number;
  date: string;
}

export interface StressScenario {
  scenario_id: number;
  name: string;
  description: string | null;
  income_impact_pct: string;
  expense_impact_pct: string;
}

export interface StressResult {
  id: number;
  scenarioId: number;
  scenarioName: string;
  scenarioDescription: string | null;
  monthsOfRunway: number;
  weakestPoint: string | null;
  recommendation: string | null;
  isStale: boolean;
  runAt: string;
}

export interface Goal {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string | null;
  priority: number;
  status: 'ACTIVE' | 'COMPLETED' | 'ARCHIVED';
  progress: number;
}

export interface GoalConflict {
  id: number;
  goalIds: number[];
  recommendedPlan: unknown;
  resolutionStatus: 'PENDING' | 'ACCEPTED' | 'MODIFIED' | 'DISMISSED';
  detectedAt: string;
}

export interface DecisionEvaluation {
  id: number;
  verdict: 'ADVISABLE' | 'CAUTION' | 'NOT_ADVISABLE';
  reasoning: string;
  snapshot: Record<string, unknown>;
}

export interface AdvisorMessage {
  message: string;
  messageId: number;
  createdAt: string;
  generatedByAI: boolean;
}

export interface AdvisorHistoryMessage {
  id: number;
  sender: 'USER' | 'AI';
  text: string;
  createdAt: string;
}

// ---------- Dashboard ----------
export const getDashboardSummary = async () => {
  const { data } = await api.get<{ summary: DashboardSummary }>('/dashboard/summary');
  return data.summary;
};

export const getDashboardTrends = async () => {
  const { data } = await api.get<DashboardTrends>('/dashboard/trends');
  return data;
};

export const getAiInsights = async (limit = 6) => {
  const { data } = await api.get<{ insights: AiInsight[] }>('/dashboard/insights', { params: { limit } });
  return data.insights;
};

// ---------- Finances ----------
export interface FinanceRecordMap {
  income: Array<Record<string, unknown>>;
  expense: Array<Record<string, unknown>>;
  asset: Array<Record<string, unknown>>;
  liability: Array<Record<string, unknown>>;
  investment: Array<Record<string, unknown>>;
}

export const getFinanceRecords = async (): Promise<FinanceRecordMap> => {
  const { data } = await api.get<FinanceRecordMap>('/finances/records');
  return data;
};

export const getFinanceRecordsByType = async (type: FinanceType) => {
  const { data } = await api.get<{ type: FinanceType; records: Array<Record<string, unknown>> }>('/finances/records', {
    params: { type },
  });
  return data.records;
};

export const createFinanceRecord = async (type: FinanceType, payload: Record<string, unknown>) => {
  const { data } = await api.post<{ record: Record<string, unknown> }>('/finances/records', { type, ...payload });
  return data.record;
};

export const updateFinanceRecord = async (id: number, type: FinanceType, payload: Record<string, unknown>) => {
  const { data } = await api.put<{ record: Record<string, unknown> }>(`/finances/records/${id}`, { type, ...payload });
  return data.record;
};

export const deleteFinanceRecord = async (id: number, type: FinanceType) => {
  const { data } = await api.delete(`/finances/records/${id}`, { data: { type } });
  return data;
};

// ---------- Wealth score ----------
export const getWealthScore = async () => {
  const { data } = await api.get<{ score: WealthScore | null }>('/wealth-score');
  return data.score;
};

export const getWealthScoreHistory = async (limit = 12) => {
  const { data } = await api.get<{ history: WealthScoreHistoryPoint[] }>('/wealth-score/history', { params: { limit } });
  return data.history;
};

export const explainWealthScore = async () => {
  const { data } = await api.post<{ explanation: string }>('/wealth-score/explain');
  return data.explanation;
};

// ---------- Stress test ----------
export const getStressScenarios = async () => {
  const { data } = await api.get<{ scenarios: StressScenario[] }>('/stress-test/scenarios');
  return data.scenarios;
};

export const runStressTest = async (scenarioId: number) => {
  const { data } = await api.post<{ result: StressResult }>('/stress-test/run', { scenario_id: scenarioId });
  return data.result;
};

export const getLatestStressResult = async () => {
  const { data } = await api.get<{ result: StressResult | null }>('/stress-test/latest');
  return data.result;
};

// ---------- Goals ----------
export const getGoals = async () => {
  const { data } = await api.get<{ goals: Goal[] }>('/goals');
  return data.goals;
};

export const createGoal = async (payload: { goal_name: string; target_amount: number; target_date?: string; priority?: number; current_amount?: number }) => {
  const { data } = await api.post<{ goal: Goal }>('/goals', payload);
  return data.goal;
};

export const updateGoal = async (id: number, payload: Partial<{ goal_name: string; target_amount: number; target_date: string; current_amount: number; priority: number; status: string }>) => {
  const { data } = await api.put<{ goal: Goal }>(`/goals/${id}`, payload);
  return data.goal;
};

export const deleteGoal = async (id: number) => {
  const { data } = await api.delete(`/goals/${id}`);
  return data;
};

export const getGoalConflicts = async () => {
  const { data } = await api.get<{ conflicts: GoalConflict[] }>('/goals/conflicts');
  return data.conflicts;
};

export const resolveConflict = async (id: number, action: 'ACCEPTED' | 'MODIFIED' | 'DISMISSED') => {
  const { data } = await api.post<{ id: number; resolutionStatus: string }>(`/goals/conflicts/${id}/resolve`, { action });
  return data;
};

export const evaluateDecision = async (decision_description: string) => {
  const { data } = await api.post<{ evaluation: DecisionEvaluation }>('/decisions/evaluate', { decision_description });
  return data.evaluation;
};

// ---------- Advisor ----------
export const sendAdvisorMessage = async (message: string) => {
  const { data } = await api.post<AdvisorMessage>('/advisor/chat', { message });
  return data;
};

export const getAdvisorHistory = async () => {
  const { data } = await api.get<{ messages: AdvisorHistoryMessage[] }>('/advisor/history');
  return data.messages;
};

// ---------- Profile / settings ----------
export interface Me {
  id: number;
  fullName: string;
  email: string;
  role: string;
  status: string;
  lastLoginAt: string | null;
  createdAt: string;
}

export const getMe = async () => {
  const { data } = await api.get<{ user: Me }>('/users/me');
  return data.user;
};

export const updateMe = async (payload: Partial<{ full_name: string; email: string }>) => {
  const { data } = await api.put<{ user: Me }>('/users/me', payload);
  return data.user;
};

export const changePassword = async (current_password: string, new_password: string) => {
  const { data } = await api.post<{ message: string }>('/auth/change-password', { current_password, new_password });
  return data.message;
};

export const logoutUser = async () => {
  const { data } = await api.post<{ blacklisted: boolean }>('/auth/logout');
  return data;
};

// ---------- Admin ----------
export interface UsageSummary {
  totalUsers: number;
  activeUsers: number;
  userGrowth: Array<{ month: string; count: number }>;
  recordCounts: {
    incomes: number;
    expenses: number;
    assets: number;
    liabilities: number;
    investments: number;
  };
  recentScoresCount: number;
  totalInsights: number;
  totalChatMessages: number;
  totalStressTests: number;
  totalDecisionEvaluations: number;
}

export interface SystemStatus {
  database: { status: string; latencyMs?: number; error?: string };
  redis: { status: string; latencyMs?: number; error?: string };
  aiProvider: { provider: string; configured: boolean; status: string };
  serverUptime: number;
}

export interface AiConfigItem {
  name: string;
  apiKeyConfigured: boolean;
  apiKeyMasked: string | null;
}

export interface AiConfig {
  currentProvider: string;
  availableProviders: AiConfigItem[];
  healthCheck: { provider: string; reachable: boolean };
}

export interface AuditLog {
  id: number;
  userId: number | null;
  actorName: string;
  actorEmail: string;
  action: string;
  resourceType: string | null;
  resourceId: number | null;
  ipAddress: string | null;
  createdAt: string;
}

export interface AuditLogsResponse {
  logs: AuditLog[];
  pagination: { total: number; page: number; limit: number; totalPages: number };
}

export const getUsageSummary = async () => {
  const { data } = await api.get<{ summary: UsageSummary }>('/admin/usage-summary');
  return data.summary;
};

export const getSystemStatus = async () => {
  const { data } = await api.get<{ status: SystemStatus }>('/admin/system-status');
  return data.status;
};

export const getAiConfig = async () => {
  const { data } = await api.get<{ config: AiConfig }>('/admin/ai-config');
  return data.config;
};

export const updateAiConfig = async (provider: string) => {
  const { data } = await api.put<{ currentProvider: string; apiKeyConfigured: boolean; message: string }>('/admin/ai-config', { provider });
  return data;
};

export const getAuditLogs = async (params?: { search?: string; action?: string; user_id?: number; page?: number; limit?: number }) => {
  const { data } = await api.get<AuditLogsResponse>('/admin/audit-logs', { params });
  return data;
};

export const exportAuditLogs = async (format: 'csv' | 'json' = 'csv') => {
  const { data } = await api.get<{ format: string; data: string | AuditLog[] }>('/admin/audit-logs/export', { params: { format } });
  return data;
};