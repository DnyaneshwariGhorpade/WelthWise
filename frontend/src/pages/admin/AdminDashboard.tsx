import { useCallback, useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, UserCheck, Database, Cpu, MessageSquare, Target, Activity, Shield, CheckCircle, XCircle, Hourglass } from 'lucide-react';
import { getUsageSummary, getSystemStatus, UsageSummary, SystemStatus } from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, StatCard, Badge, ErrorNotice } from '../../components/ui';

function statusBadge(status: string) {
  const s = String(status || '').toLowerCase();
  if (s.includes('healthy') || s === 'ok' || s === 'up' || s === 'connected' || s === 'ready') return <Badge color="emerald">Healthy</Badge>;
  if (s.includes('unconfigured') || s.includes('disconnected') || s.includes('down') || s.includes('error')) return <Badge color="red">Problem</Badge>;
  return <Badge color="amber">{status}</Badge>;
}

export default function AdminDashboard() {
  const [summary, setSummary] = useState<UsageSummary | null>(null);
  const [status, setStatus] = useState<SystemStatus | null>(null);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, st] = await Promise.all([getUsageSummary(), getSystemStatus()]);
      setSummary(s);
      setStatus(st);
    } catch (err) {
      setError(apiErr(err, 'Failed to load admin dashboard'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (error) {
    return (
      <div className="py-20">
        <ErrorNotice message={error} />
      </div>
    );
  }

  if (!summary || !status) {
    return <Card className="p-10 text-center text-sm text-slate-400 animate-pulse">Loading admin dashboard…</Card>;
  }

  const uptimeHrs = Math.floor(status.serverUptime / 3600);

  return (
    <div>
      <PageHeader title="Admin Dashboard" subtitle="Platform usage and infrastructure health." />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Total Users" value={summary.totalUsers} icon={<Users className="h-5 w-5" />} />
        <StatCard label="Active Users" value={summary.activeUsers} icon={<UserCheck className="h-5 w-5" />} accent="blue" />
        <StatCard label="Chat Messages" value={summary.totalChatMessages} icon={<MessageSquare className="h-5 w-5" />} accent="violet" />
        <StatCard label="Decision Checks" value={summary.totalDecisionEvaluations} icon={<Target className="h-5 w-5" />} accent="amber" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">User Growth (last 6 months)</h3>
          {summary.userGrowth.length ? (
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={summary.userGrowth} margin={{ top: 5, right: 10, bottom: 0, left: -15 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip formatter={(v: number) => [v, 'New users']} />
                  <Bar dataKey="count" fill="#059669" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-sm text-slate-400">No user growth data yet.</p>
          )}

          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Stress Tests</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{summary.totalStressTests}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Scores Calculated</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{summary.recentScoresCount}</p>
            </div>
            <div className="bg-slate-50 rounded-xl p-4">
              <p className="text-xs text-slate-500">Insights Generated</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{summary.totalInsights}</p>
            </div>
          </div>
        </Card>

        <div className="space-y-6">
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
              <Activity className="h-4 w-4 text-emerald-600" />
              Infrastructure
            </h3>
            <div className="space-y-4">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Database className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">Database</p>
                    <p className="text-xs text-slate-500">{status.database.error ? status.database.error : status.database.latencyMs != null ? `${status.database.latencyMs} ms latency` : status.database.status}</p>
                  </div>
                </div>
                {statusBadge(status.database.status)}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Hourglass className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">Redis</p>
                    <p className="text-xs text-slate-500">{status.redis.error ? status.redis.error : status.redis.latencyMs != null ? `${status.redis.latencyMs} ms latency` : status.redis.status}</p>
                  </div>
                </div>
                {statusBadge(status.redis.status)}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Cpu className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">AI Provider</p>
                    <p className="text-xs text-slate-500">
                      {status.aiProvider.provider} · {status.aiProvider.configured ? 'configured' : 'not configured'}
                    </p>
                  </div>
                </div>
                {statusBadge(status.aiProvider.status)}
              </div>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <Shield className="h-4 w-4 text-slate-400 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">Server Uptime</p>
                    <p className="text-xs text-slate-500">{uptimeHrs > 0 ? `${uptimeHrs} hrs ${Math.floor((status.serverUptime % 3600) / 60)} min` : 'less than a minute'}</p>
                  </div>
                </div>
                {status.serverUptime > 0 ? <CheckCircle className="h-4 w-4 text-emerald-500 shrink-0" /> : <XCircle className="h-4 w-4 text-red-500 shrink-0" />}
              </div>
            </div>
          </Card>

          <Card className="p-5">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Financial Records</h3>
            <div className="space-y-2">
              {(
                [
                  ['Incomes', summary.recordCounts.incomes],
                  ['Expenses', summary.recordCounts.expenses],
                  ['Assets', summary.recordCounts.assets],
                  ['Liabilities', summary.recordCounts.liabilities],
                  ['Investments', summary.recordCounts.investments],
                ] as const
              ).map(([label, count]) => (
                <div key={label} className="flex justify-between text-sm">
                  <span className="text-slate-500">{label}</span>
                  <span className="font-semibold text-slate-800">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}