import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  Gauge,
  Target,
  AlertTriangle,
  Sparkles,
  ChevronRight,
  Activity,
} from 'lucide-react';
import {
  getDashboardSummary,
  getDashboardTrends,
  getAiInsights,
  DashboardSummary,
  DashboardTrends,
  AiInsight,
} from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, StatCard, fmtMoney, fmtDateTime } from '../../components/ui';

const insightIcon: Record<AiInsight['type'], typeof Sparkles> = {
  SCORE_CHANGE: TrendingUp,
  GOAL_CONFLICT: AlertTriangle,
  STRESS_ALERT: Activity,
  GENERAL: Sparkles,
};

function iconFor(type: AiInsight['type']) {
  return insightIcon[type] ?? Sparkles;
}

export default function Dashboard() {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [trends, setTrends] = useState<DashboardTrends | null>(null);
  const [insights, setInsights] = useState<AiInsight[]>([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([getDashboardSummary(), getDashboardTrends(), getAiInsights()])
      .then(([s, t, i]) => {
        setSummary(s);
        setTrends(t);
        setInsights(i);
      })
      .catch((err) => setError(apiErr(err)));
  }, []);

  if (error) {
    return (
      <div className="text-center py-20">
        <p className="text-red-600">{error}</p>
        <Link to="/login" className="mt-4 inline-block text-emerald-600 font-medium text-sm">
          Back to login
        </Link>
      </div>
    );
  }

  if (!summary) {
    return <div className="py-20 text-center text-sm text-slate-400 animate-pulse">Loading your dashboard…</div>;
  }

  const snapshotData = (trends?.snapshotTrend || []).map((p) => ({
    ...p,
    date: new Date(p.date).toLocaleDateString(undefined, { month: 'short' }),
  }));
  const scoreData = (trends?.scoreTrend || []).map((p) => ({
    ...p,
    date: new Date(p.date).toLocaleDateString(undefined, { month: 'short' }),
  }));

  const quickNav = [
    { to: '/app/finances', label: 'Track Finances', icon: Wallet },
    { to: '/app/wealth-score', label: 'View Wealth Score', icon: Gauge },
    { to: '/app/stress-test', label: 'Run Stress Test', icon: Activity },
    { to: '/app/goals', label: 'Manage Goals', icon: Target },
  ];

  return (
    <div>
      <PageHeader
        title="Welcome back"
        subtitle="Your money snapshot, at a glance."
        actions={
          <Link
            to="/app/goals"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            <Sparkles className="h-4 w-4" />
            Plan a Goal
          </Link>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Net Worth"
          value={fmtMoney(summary.netWorth)}
          icon={<Wallet className="h-5 w-5" />}
          hint="Total assets minus liabilities"
        />
        <StatCard
          label="Monthly Income"
          value={fmtMoney(summary.monthlyIncome)}
          icon={<TrendingUp className="h-5 w-5" />}
          accent="blue"
        />
        <StatCard
          label="Monthly Expenses"
          value={fmtMoney(summary.monthlyExpense)}
          icon={<TrendingDown className="h-5 w-5" />}
          accent="amber"
        />
        <StatCard
          label="Liquid Assets"
          value={fmtMoney(summary.liquidAssets)}
          icon={<PiggyBank className="h-5 w-5" />}
          accent="violet"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
        <StatCard
          label="Wealth Score"
          value={summary.wealthScore !== null ? summary.wealthScore + ' / 100' : '—'}
          icon={<Gauge className="h-5 w-5" />}
          hint={summary.wealthScore !== null ? 'Current score' : 'Add financial data to get scored'}
        />
        <StatCard
          label="Active Goals"
          value={summary.activeGoals}
          icon={<Target className="h-5 w-5" />}
          accent="violet"
        />
        <StatCard
          label="Pending Conflicts"
          value={summary.pendingConflicts}
          icon={<AlertTriangle className="h-5 w-5" />}
          accent={summary.pendingConflicts > 0 ? 'red' : 'emerald'}
          hint={summary.pendingConflicts > 0 ? 'Goals need your attention' : 'All clear'}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Wealth Trend</h3>
            {snapshotData.length ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={snapshotData} margin={{ top: 5, right: 10, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="netWorth" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#059669" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="#059669" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v >= 1000 ? (v / 1000).toFixed(0) + 'k' : v}`} />
                    <Tooltip formatter={(v: number, name: string) => [fmtMoney(v), name === 'netWorth' ? 'Net Worth' : name === 'income' ? 'Income' : 'Expenses']} />
                    <Area type="monotone" dataKey="netWorth" name="netWorth" stroke="#059669" strokeWidth={2} fill="url(#netWorth)" />
                    <Area type="monotone" dataKey="income" name="income" stroke="#3b82f6" strokeWidth={2} fill="none" />
                    <Area type="monotone" dataKey="expense" name="expense" stroke="#f59e0b" strokeWidth={2} fill="none" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No history yet — your score and trends will appear once you add financial data.</p>
            )}
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Score History</h3>
            {scoreData.length ? (
              <div className="h-40">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={scoreData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [`${v} / 100`, 'Score']} />
                    <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No score history yet.</p>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-600" />
              AI Insights
            </h3>
            <div className="space-y-3">
              {insights.length === 0 && <p className="text-sm text-slate-400">No insights yet. Explore your finances to get personalized advice.</p>}
              {insights.map((ins) => {
                const Icon = iconFor(ins.type);
                return (
                  <div key={ins.id} className="flex gap-3 border border-slate-100 rounded-xl p-3">
                    <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm text-slate-700 leading-snug">{ins.message}</p>
                      <p className="text-xs text-slate-400 mt-1">{fmtDateTime(ins.createdAt)}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Quick Actions</h3>
            <div className="space-y-2">
              {quickNav.map((q) => (
                <Link
                  key={q.to}
                  to={q.to}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-slate-100 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors group"
                >
                  <q.icon className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium text-slate-700 group-hover:text-emerald-800">{q.label}</span>
                  <ChevronRight className="h-4 w-4 text-slate-300 ml-auto" />
                </Link>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}