import { useCallback, useEffect, useState } from 'react';
import { Activity, Zap, AlertTriangle, Lightbulb, Clock } from 'lucide-react';
import {
  getStressScenarios,
  runStressTest,
  getLatestStressResult,
  StressScenario,
  StressResult,
} from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, Button, Badge, ErrorNotice } from '../../components/ui';

function runwayColor(months: number) {
  if (months >= 6) return 'emerald';
  if (months >= 3) return 'amber';
  return 'red';
}

function runwayLabel(months: number) {
  if (months >= 6) return 'Resilient';
  if (months >= 3) return 'Manageable';
  return 'At risk';
}

export default function StressTestPage() {
  const [scenarios, setScenarios] = useState<StressScenario[]>([]);
  const [selected, setSelected] = useState<number | null>(null);
  const [result, setResult] = useState<StressResult | null>(null);
  const [running, setRunning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setError('');
    try {
      const [sc, latest] = await Promise.all([getStressScenarios(), getLatestStressResult()]);
      setScenarios(sc);
      setResult(latest);
      if (sc.length && !selected) setSelected(sc[0].scenario_id);
    } catch (err) {
      setError(apiErr(err, 'Failed to load stress test options'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const run = async () => {
    if (!selected) return;
    setRunning(true);
    setError('');
    try {
      setResult(await runStressTest(selected));
    } catch (err) {
      setError(apiErr(err, 'Stress test failed'));
    } finally {
      setRunning(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Stress Test"
        subtitle="Simulate a financial shock and see how long your money would last."
        actions={
          <Button onClick={run} disabled={!selected || running}>
            <Zap className="h-4 w-4" />
            {running ? 'Simulating…' : 'Run Simulation'}
          </Button>
        }
      />

      <ErrorNotice message={error} />

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400 animate-pulse">Loading scenarios…</Card>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {scenarios.map((s) => {
              const isSel = selected === s.scenario_id;
              return (
                <button
                  key={s.scenario_id}
                  onClick={() => setSelected(s.scenario_id)}
                  className={`text-left rounded-2xl border p-5 transition-all ${
                    isSel
                      ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/40'
                      : 'border-slate-200 bg-white hover:border-emerald-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <div className="h-9 w-9 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center">
                      <Activity className="h-4 w-4" />
                    </div>
                    <h3 className="font-bold text-slate-900">{s.name}</h3>
                  </div>
                  <p className="mt-3 text-sm text-slate-600 line-clamp-2">{s.description || 'No description'}</p>
                  <div className="mt-4 flex gap-2 text-xs">
                    <Badge color="red">Income −{Number(String(s.income_impact_pct).replace('%', ''))}%</Badge>
                    <Badge color="amber">Expenses +{Number(String(s.expense_impact_pct).replace('%', ''))}%</Badge>
                  </div>
                </button>
              );
            })}
          </div>

          {result && (
            <Card className="mt-6 p-6">
              <div className="flex items-center justify-between mb-5">
                <h2 className="text-lg font-bold text-slate-900">Result: {result.scenarioName}</h2>
                {result.isStale ? (
                  <Badge color="amber">
                    <Clock className="h-3 w-3 inline mr-1" />
                    Based on older data — rerun for current figures
                  </Badge>
                ) : (
                  <Badge color="emerald">Fresh — calculated just now</Badge>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-slate-50 rounded-xl p-5 text-center">
                  <p className="text-xs uppercase tracking-wider text-slate-500">Survival Runway</p>
                  <p className="mt-2 text-3xl font-extrabold text-slate-900">
                    {Math.floor(result.monthsOfRunway)} mo
                  </p>
                  <div className="mt-2">
                    <Badge color={runwayColor(result.monthsOfRunway)}>{runwayLabel(result.monthsOfRunway)}</Badge>
                  </div>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> Weakest Point
                  </p>
                  <p className="mt-2 text-sm font-medium text-slate-800">{result.weakestPoint || '—'}</p>
                </div>

                <div className="bg-slate-50 rounded-xl p-5">
                  <p className="text-xs uppercase tracking-wider text-slate-500 flex items-center gap-1">
                    <Lightbulb className="h-3 w-3" /> Recommendation
                  </p>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{result.recommendation || 'No recommendation.'}</p>
                </div>
              </div>

              <p className="mt-4 text-xs text-slate-400">
                Ran {new Date(result.runAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}