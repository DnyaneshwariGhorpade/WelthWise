import { useCallback, useEffect, useState } from 'react';
import { Plus, Pencil, Trash2, Wallet, TrendingUp, TrendingDown, Home, CreditCard, BarChart3 } from 'lucide-react';
import {
  getFinanceRecordsByType,
  createFinanceRecord,
  updateFinanceRecord,
  deleteFinanceRecord,
  FinanceType,
} from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, Button, Badge, ErrorNotice, fmtMoney, EmptyState } from '../../components/ui';

interface FieldDef {
  key: string;
  label: string;
  type: 'text' | 'number' | 'select';
  options?: string[];
  idField: string;
  money?: boolean;
  amount?: string;
}

const CONFIG: Record<FinanceType, { label: string; icon: typeof Wallet; fields: FieldDef[] }> = {
  income: {
    label: 'Income',
    icon: TrendingUp,
    fields: [
      { key: 'source', label: 'Source', type: 'text', idField: 'income_id', amount: 'amount' },
      { key: 'amount', label: 'Amount', type: 'number', idField: 'income_id', money: true, amount: 'amount' },
      { key: 'frequency', label: 'Frequency', type: 'select', options: ['MONTHLY', 'QUARTERLY', 'YEARLY'], idField: 'income_id', amount: 'amount' },
    ],
  },
  expense: {
    label: 'Expenses',
    icon: TrendingDown,
    fields: [
      { key: 'category', label: 'Category', type: 'text', idField: 'expense_id', amount: 'amount' },
      { key: 'amount', label: 'Amount', type: 'number', idField: 'expense_id', money: true, amount: 'amount' },
      { key: 'frequency', label: 'Frequency', type: 'select', options: ['MONTHLY', 'QUARTERLY', 'YEARLY'], idField: 'expense_id', amount: 'amount' },
    ],
  },
  asset: {
    label: 'Assets',
    icon: Home,
    fields: [
      { key: 'asset_type', label: 'Asset Type', type: 'text', idField: 'asset_id' },
      { key: 'current_value', label: 'Current Value', type: 'number', idField: 'asset_id', money: true },
      { key: 'liquidity_level', label: 'Liquidity', type: 'select', options: ['HIGH', 'MEDIUM', 'LOW'], idField: 'asset_id' },
    ],
  },
  liability: {
    label: 'Liabilities',
    icon: CreditCard,
    fields: [
      { key: 'liability_type', label: 'Liab. Type', type: 'text', idField: 'liability_id' },
      { key: 'outstanding_amount', label: 'Outstanding', type: 'number', idField: 'liability_id', money: true },
      { key: 'interest_rate', label: 'Interest %', type: 'number', idField: 'liability_id' },
    ],
  },
  investment: {
    label: 'Investments',
    icon: BarChart3,
    fields: [
      { key: 'investment_type', label: 'Type', type: 'text', idField: 'investment_id' },
      { key: 'amount_invested', label: 'Invested', type: 'number', idField: 'investment_id', money: true },
      { key: 'risk_level', label: 'Risk', type: 'select', options: ['LOW', 'MEDIUM', 'HIGH'], idField: 'investment_id' },
    ],
  },
};

const TABS: FinanceType[] = ['income', 'expense', 'asset', 'liability', 'investment'];

function amountOf(record: Record<string, unknown>, field: FieldDef): number | null {
  const key = field.amount || field.key;
  const v = record[key];
  return v === null || v === undefined ? null : Number(v);
}

export default function Finances() {
  const [activeTab, setActiveTab] = useState<FinanceType>('income');
  const [records, setRecords] = useState<Array<Record<string, unknown>>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Record<string, unknown> | null>(null);
  const [form, setForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      setRecords(await getFinanceRecordsByType(activeTab));
    } catch (err) {
      setError(apiErr(err, 'Failed to load records'));
    } finally {
      setLoading(false);
    }
  }, [activeTab]);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = () => {
    const initial: Record<string, string> = {};
    for (const f of CONFIG[activeTab].fields) {
      if (f.type === 'select') initial[f.key] = f.options?.[0] || '';
      else initial[f.key] = '';
    }
    setEditing(null);
    setForm(initial);
    setFormOpen(true);
  };

  const openEdit = (record: Record<string, unknown>) => {
    const initial: Record<string, string> = {};
    for (const f of CONFIG[activeTab].fields) {
      const v = record[f.key];
      initial[f.key] = v === null || v === undefined ? '' : String(v);
    }
    setEditing(record);
    setForm(initial);
    setFormOpen(true);
  };

  const save = async () => {
    setSaving(true);
    setError('');
    try {
      if (editing) {
        const idField = CONFIG[activeTab].fields[0].idField;
        await updateFinanceRecord(Number(editing[idField]), activeTab, form);
      } else {
        await createFinanceRecord(activeTab, form);
      }
      setFormOpen(false);
      load();
    } catch (err) {
      setError(apiErr(err, 'Failed to save record'));
    } finally {
      setSaving(false);
    }
  };

  const remove = async (record: Record<string, unknown>) => {
    const idField = CONFIG[activeTab].fields[0].idField;
    if (!window.confirm('Delete this record? This cannot be undone.')) return;
    setError('');
    try {
      await deleteFinanceRecord(Number(record[idField]), activeTab);
      load();
    } catch (err) {
      setError(apiErr(err, 'Failed to delete record'));
    }
  };

  const config = CONFIG[activeTab];
  const moneyField = config.fields.find((f) => f.money)?.key;

  return (
    <div>
      <PageHeader
        title="My Finances"
        subtitle="Track income, expenses, assets, liabilities, and investments."
        actions={
          <Button onClick={openAdd}>
            <Plus className="h-4 w-4" />
            Add {config.label}
          </Button>
        }
      />

      <ErrorNotice message={error} />

      <div className="flex gap-2 mb-6 flex-wrap">
        {TABS.map((t) => {
          const c = CONFIG[t];
          const active = t === activeTab;
          return (
            <button
              key={t}
              onClick={() => setActiveTab(t)}
              className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                active ? 'bg-emerald-600 text-white' : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <c.icon className="h-4 w-4" />
              {c.label}
            </button>
          );
        })}
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400 animate-pulse">Loading records…</div>
        ) : records.length === 0 ? (
          <EmptyState
            icon={<Wallet className="h-6 w-6" />}
            title={`No ${config.label.toLowerCase()} recorded`}
            message="Add your first record to start building your wealth picture."
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  {config.fields.map((f) => (
                    <th key={f.key} className="px-5 py-3 font-medium">
                      {f.label}
                    </th>
                  ))}
                  <th className="px-5 py-3 font-medium">Created</th>
                  <th className="px-5 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {records.map((r, i) => (
                  <tr key={String(r[config.fields[0].idField]) || i} className="hover:bg-slate-50/50">
                    {config.fields.map((f) => (
                      <td key={f.key} className="px-5 py-3 text-slate-700">
                        {f.type === 'select' ? (
                          <Badge color={f.key === 'frequency' || f.key === 'liquidity_level' ? 'blue' : 'amber'}>{String(r[f.key] ?? '—')}</Badge>
                        ) : f.money ? (
                          <span className="font-semibold">{fmtMoney(amountOf(r, f))}</span>
                        ) : f.key === 'interest_rate' ? (
                          `${r[f.key] ?? '—'}%`
                        ) : (
                          String(r[f.key] ?? '—')
                        )}
                      </td>
                    ))}
                    <td className="px-5 py-3 text-slate-400 text-xs">
                      {new Date(String(r.created_at)).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex justify-end gap-1">
                        <button onClick={() => openEdit(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-600 hover:bg-emerald-50" aria-label="Edit">
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button onClick={() => remove(r)} className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50" aria-label="Delete">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {moneyField && (
        <p className="mt-3 text-xs text-slate-400">
          Total: <span className="font-semibold text-slate-600">{fmtMoney(records.reduce((sum, r) => sum + (Number(r[moneyField]) || 0), 0))}</span>
        </p>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4" onClick={() => !saving && setFormOpen(false)}>
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-slate-900 mb-4">{editing ? `Edit ${config.label}` : `Add ${config.label}`}</h3>
            <div className="space-y-4">
              {config.fields.map((f) => (
                <div key={f.key}>
                  <label className="block text-sm font-medium text-slate-700 mb-1">{f.label}</label>
                  {f.type === 'select' ? (
                    <select
                      value={form[f.key] || ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      {f.options?.map((o) => (
                        <option key={o} value={o}>
                          {o}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <input
                      type={f.type === 'number' ? 'number' : 'text'}
                      step={f.money ? '0.01' : undefined}
                      value={form[f.key] || ''}
                      onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    />
                  )}
                </div>
              ))}
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