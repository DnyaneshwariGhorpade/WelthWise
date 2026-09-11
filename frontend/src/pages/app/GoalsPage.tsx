import { useCallback, useEffect, useState } from 'react';
import { Plus, Target, Trash2, Pencil, AlertTriangle, Check, Hammer, X } from 'lucide-react';
import {
  getGoals,
  createGoal,
  updateGoal,
  deleteGoal,
  getGoalConflicts,
  resolveConflict,
  evaluateDecision,
  Goal,
  GoalConflict,
  DecisionEvaluation,
} from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, Button, Badge, ErrorNotice, EmptyState, fmtMoney, fmtDate } from '../../components/ui';

function priorityLabel(p: number) {
  return p <= 1 ? 'High' : p <= 2 ? 'Medium' : 'Low';
}

export default function GoalsPage() {
  const [goals, setGoals] = useState<Goal[]>([]);
  const [conflicts, setConflicts] = useState<GoalConflict[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Goal | null>(null);
  const [form, setForm] = useState({ goal_name: '', target_amount: '', target_date: '', current_amount: '', priority: '2' });
  const [saving, setSaving] = useState(false);
  const [evalDecision, setEvalDecision] = useState('');
  const [evalResult, setEvalResult] = useState<DecisionEvaluation | null>(null);
  const [evalLoading, setEvalLoading] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      const [g, c] = await Promise.all([getGoals(), getGoalConflicts()]);
      setGoals(g);
      setConflicts(c);
    } catch (err) {
      setError(apiErr(err, 'Failed to load goals'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    setEditing(null);
    setForm({ goal_name: '', target_amount: '', target_date: '', current_amount: '', priority: '2' });
    setFormOpen(true);
  };

  const openEdit = (goal: Goal) => {
    setEditing(goal);
    setForm({
      goal_name: goal.name,
      target_amount: String(goal.targetAmount),
      target_date: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
      current_amount: String(goal.currentAmount),
      priority: String(goal.priority),
    });
    setFormOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      const payload = {
        goal_name: form.goal_name,
        target_amount: Number(form.target_amount),
        target_date: form.target_date || undefined,
        current_amount: form.current_amount ? Number(form.current_amount) : undefined,
        priority: Number(form.priority),
      };
      if (editing) {
        await updateGoal(editing.id, payload);
      } else {
        await createGoal(payload);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(apiErr(err, 'Failed to save goal'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (goal: Goal) => {
    if (!window.confirm(`Delete "${goal.name}"?`)) return;
    setError('');
    try {
      await deleteGoal(goal.id);
      load();
    } catch (err) {
      setError(apiErr(err, 'Failed to delete goal'));
    }
  };

  const resolve = async (conflict: GoalConflict, action: 'ACCEPTED' | 'MODIFIED' | 'DISMISSED') => {
    setError('');
    try {
      await resolveConflict(conflict.id, action);
      load();
    } catch (err) {
      setError(apiErr(err, 'Failed to resolve conflict'));
    }
  };

  const evaluate = async () => {
    if (!evalDecision.trim()) return;
    setEvalLoading(true);
    setError('');
    try {
      setEvalResult(await evaluateDecision(evalDecision.trim()));
    } catch (err) {
      setError(apiErr(err, 'Decision evaluation failed'));
    } finally {
      setEvalLoading(false);
    }
  };

  const verdictColor = { ADVISABLE: 'emerald', CAUTION: 'amber', NOT_ADVISABLE: 'red' } as const;

  return (
    <div>
      <PageHeader
        title="Goals & Conflict Advisor"
        subtitle="Plan your future and let AI flag conflicts between your goals."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            New Goal
          </Button>
        }
      />

      <ErrorNotice message={error} />

      {loading ? (
        <Card className="p-10 text-center text-sm text-slate-400 animate-pulse">Loading goals…</Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {goals.length === 0 ? (
              <Card>
                <EmptyState
                  icon={<Target className="h-6 w-6" />}
                  title="No goals yet"
                  message="Set your first financial goal — an emergency fund, a house, retirement — and track your progress."
                />
              </Card>
            ) : (
              goals.map((goal) => (
                <Card key={goal.id} className="p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-bold text-slate-900">{goal.name}</h3>
                      <p className="mt-1 text-sm text-slate-500">
                        {fmtMoney(goal.currentAmount)} of {fmtMoney(goal.targetAmount)} · due {fmtDate(goal.targetDate)}
                      </p>
                      <div className="mt-3 flex gap-2">
                        <Badge color={goal.status === 'ACTIVE' ? 'emerald' : goal.status === 'ARCHIVED' ? 'slate' : 'blue'}>
                          {goal.status}
                        </Badge>
                        <Badge color={goal.priority <= 1 ? 'amber' : goal.priority === 2 ? 'blue' : 'slate'}>
                          {priorityLabel(goal.priority)} priority
                        </Badge>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button onClick={() => openEdit(goal)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" aria-label="Edit">
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button onClick={() => remove(goal)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" aria-label="Delete">
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <div className="mt-4">
                    <div className="flex justify-between text-xs mb-1">
                      <span className="text-slate-500">Progress</span>
                      <span className="font-semibold text-slate-700">{goal.progress.toFixed(0)}%</span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-emerald-600 transition-all duration-700"
                        style={{ width: `${Math.min(100, goal.progress)}%` }}
                      />
                    </div>
                  </div>
                </Card>
              ))
            )}
          </div>

          <div className="space-y-6">
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-4">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                Detected Conflicts
              </h3>
              {conflicts.length === 0 ? (
                <p className="text-sm text-slate-400">No active conflicts. Your goals are aligned.</p>
              ) : (
                <div className="space-y-4">
                  {conflicts.map((c) => (
                    <div key={c.id} className="border border-amber-200 bg-amber-50/50 rounded-xl p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge color={c.resolutionStatus === 'PENDING' ? 'amber' : 'emerald'}>{c.resolutionStatus}</Badge>
                      </div>
                      <p className="text-sm text-slate-700">
                        {c.goalIds.length > 1
                          ? `Competing goals (#${c.goalIds.join(', #')}) — the AI suggests a combined plan.`
                          : 'The AI has recommended a plan for this goal.'}
                      </p>
                      {c.resolutionStatus === 'PENDING' && (
                        <div className="mt-3 flex gap-2">
                          <button onClick={() => resolve(c, 'ACCEPTED')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-600 text-white text-xs font-semibold hover:bg-emerald-700">
                            <Check className="h-3 w-3" /> Accept
                          </button>
                          <button onClick={() => resolve(c, 'MODIFIED')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50">
                            <Hammer className="h-3 w-3" /> Modify
                          </button>
                          <button onClick={() => resolve(c, 'DISMISSED')} className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-slate-500 text-xs font-semibold hover:bg-slate-100">
                            <X className="h-3 w-3" /> Dismiss
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </Card>

            <Card className="p-5">
              <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-1">
                <Target className="h-4 w-4 text-emerald-600" />
                “Should You Do This?”
              </h3>
              <p className="text-xs text-slate-500 mb-3">Run any decision past the WealthWise advisor before you commit.</p>
              <textarea
                value={evalDecision}
                onChange={(e) => setEvalDecision(e.target.value)}
                placeholder="e.g. I want to buy a $25,000 car with a 5-year loan"
                rows={3}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
              />
              <Button className="mt-3 w-full" onClick={evaluate} disabled={evalLoading || !evalDecision.trim()}>
                {evalLoading ? 'Evaluating…' : 'Evaluate'}
              </Button>
              {evalResult && (
                <div className="mt-4">
                  <Badge color={verdictColor[evalResult.verdict]}>{evalResult.verdict.replace('_', ' ')}</Badge>
                  <p className="mt-2 text-sm text-slate-700 leading-relaxed">{evalResult.reasoning}</p>
                </div>
              )}
            </Card>
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !saving && setFormOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editing ? 'Edit Goal' : 'New Goal'}</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Goal name</label>
                <input
                  value={form.goal_name}
                  onChange={(e) => setForm({ ...form, goal_name: e.target.value })}
                  placeholder="e.g. Emergency fund"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target amount ($)</label>
                  <input
                    type="number"
                    value={form.target_amount}
                    onChange={(e) => setForm({ ...form, target_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Current amount ($)</label>
                  <input
                    type="number"
                    value={form.current_amount}
                    onChange={(e) => setForm({ ...form, current_amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Target date</label>
                  <input
                    type="date"
                    value={form.target_date}
                    onChange={(e) => setForm({ ...form, target_date: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="1">High</option>
                    <option value="2">Medium</option>
                    <option value="3">Low</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <Button variant="secondary" onClick={() => setFormOpen(false)} disabled={saving}>
                Cancel
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving ? 'Saving…' : 'Save'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}