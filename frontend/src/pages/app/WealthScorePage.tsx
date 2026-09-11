import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Gauge, RefreshCw, Sparkles, ArrowRight } from 'lucide-react';
import {
  getWealthScore,
  getWealthScoreHistory,
  explainWealthScore,
  WealthScore,
  WealthScoreHistoryPoint,
} from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, ScoreGauge, Badge, Spinner, ErrorNotice } from '../../components/ui';

const FACTORS: { key: keyof Pick<WealthScore, 'savings' | 'debt' | 'liquidity' | 'growth'>; label: string; color: string; hint: string }[] = [
  { key: 'savings', label: 'Savings Behavior', color: '#059669', hint: 'Portion of income saved toward your goals' },
  { key: 'debt', label: 'Debt Management', color: '#2563eb', hint: 'Liabilities relative to your assets' },
  { key: 'liquidity', label: 'Liquidity Buffer', color: '#d97706', hint: 'Months of expenses your reserves cover' },
  { key: 'growth', label: 'Growth / Investing', color: '#7c3aed', hint: 'Investments as a share of your wealth' },
];

export default function WealthScorePage() {
  const [score, setScore] = useState<WealthScore | null>(null);
  const [history, setHistory] = useState<WealthScoreHistoryPoint[]>([]);
  const [explanation, setExplanation] = useState<string | null>(null);
  const [loadingAi, setLoadingAi] = useState(false);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [s, h] = await Promise.all([getWealthScore(), getWealthScoreHistory()]);
      setScore(s);
      setHistory(h);
      setExplanation(s?.explanation || null);
    } catch (err) {
      setError(apiErr(err, 'Failed to load your wealth score'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const regenerate = async () => {
    setLoadingAi(true);
    setError('');
    try {
      setExplanation(await explainWealthScore());
    } catch (err) {
      setError(apiErr(err, 'AI explanation failed'));
    } finally {
      setLoadingAi(false);
    }
  };

  const chartData = history.map((p) => ({ ...p, date: new Date(p.date).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) }));

  return (
    <div>
      <PageHeader title="Wealth Score" subtitle="A single number capturing the health of your finances." />

      <ErrorNotice message={error} />

      {!score ? (
        <Card className="p-8 text-center">
          <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center">
            <Gauge className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 text-lg font-bold text-slate-900">No Wealth Score yet</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            Add your income, expenses, assets, and liabilities to Financials and your Wealth Score will be computed automatically.
          </p>
          <Link
            to="/app/finances"
            className="mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700"
          >
            Add financial data <ArrowRight className="h-4 w-4" />
          </Link>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="p-6 lg:col-span-1 flex flex-col items-center">
            <ScoreGauge score={score.overall} />
            {score.overall >= 70 ? (
              <Badge color="emerald">Strong financial health</Badge>
            ) : score.overall >= 40 ? (
              <Badge color="amber">Building — keep going</Badge>
            ) : (
              <Badge color="red">Needs attention</Badge>
            )}
            <p className="mt-4 text-xs text-slate-400">
              Last calculated {new Date(score.calculatedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
            </p>
          </Card>

          <Card className="p-6 lg:col-span-2">
            <h3 className="text-sm font-semibold text-slate-900 mb-5">Sub-scores</h3>
            <div className="space-y-5">
              {FACTORS.map((f) => {
                const v = Number(score[f.key]);
                return (
                  <div key={f.key}>
                    <div className="flex justify-between text-sm mb-1.5">
                      <span className="font-medium text-slate-700">{f.label}</span>
                      <span className="font-bold text-slate-900">{v}</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full transition-all duration-700"
                        style={{ width: `${v}%`, backgroundColor: f.color }}
                      />
                    </div>
                    <p className="mt-1 text-xs text-slate-400">{f.hint}</p>
                  </div>
                );
              })}
            </div>
          </Card>

          <Card className="p-6 lg:col-span-3">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-emerald-600" />
                AI Explanation
              </h3>
              <button
                onClick={regenerate}
                disabled={loadingAi}
                className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-600 hover:text-emerald-700 disabled:opacity-50"
              >
                <RefreshCw className={`h-3.5 w-3.5 ${loadingAi ? 'animate-spin' : ''}`} />
                {loadingAi ? 'Thinking…' : 'Regenerate'}
              </button>
            </div>
            {explanation ? (
              <p className="text-sm text-slate-600 leading-relaxed">{explanation}</p>
            ) : loadingAi ? (
              <Spinner />
            ) : (
              <p className="text-sm text-slate-400">No explanation available.</p>
            )}
          </Card>

          <Card className="p-6 lg:col-span-3">
            <h3 className="text-sm font-semibold text-slate-900 mb-4">Score History</h3>
            {chartData.length ? (
              <div className="h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 0, left: -20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="date" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                    <Tooltip formatter={(v: number) => [`${v} / 100`, 'Score']} />
                    <Line type="monotone" dataKey="score" stroke="#059669" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="text-sm text-slate-400">No history yet.</p>
            )}
          </Card>
        </div>
      )}
    </div>
  );
}