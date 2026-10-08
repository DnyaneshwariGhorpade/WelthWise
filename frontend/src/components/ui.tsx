import { ReactNode } from 'react';
import { Loader2 } from 'lucide-react';

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`bg-white dark:bg-[#1A1A1A] rounded-2xl shadow-sm border border-slate-200 dark:border-[#333] transition-colors ${className}`}>
      {children}
    </div>
  );
}

export function PageHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: ReactNode }) {
  return (
    <div className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white transition-colors">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 transition-colors">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2 shrink-0">{actions}</div>}
    </div>
  );
}

export function Button({
  children,
  onClick,
  type = 'button',
  variant = 'primary',
  disabled,
  className = '',
}: {
  children: ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit';
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
  disabled?: boolean;
  className?: string;
}) {
  const styles = {
    primary: 'bg-emerald-600 text-white hover:bg-emerald-700',
    secondary: 'bg-white dark:bg-[#1A1A1A] text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-[#444] hover:bg-slate-50 dark:hover:bg-[#2A2A2A]',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    ghost: 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#2A2A2A]',
  }[variant];
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${styles} ${className}`}
    >
      {children}
    </button>
  );
}

export function StatCard({
  label,
  value,
  icon,
  hint,
  accent = 'emerald',
}: {
  label: string;
  value: ReactNode;
  icon?: ReactNode;
  hint?: string;
  accent?: 'emerald' | 'blue' | 'amber' | 'red' | 'violet';
}) {
  const accentMap = {
    emerald: 'bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400',
    blue: 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400',
    amber: 'bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400',
    red: 'bg-red-50 dark:bg-red-900/30 text-red-600 dark:text-red-400',
    violet: 'bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400',
  }[accent];
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400 transition-colors">{label}</p>
          <p className="mt-2 text-2xl font-bold text-slate-900 dark:text-white transition-colors">{value}</p>
          {hint && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 transition-colors">{hint}</p>}
        </div>
        {icon && <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-colors ${accentMap}`}>{icon}</div>}
      </div>
    </Card>
  );
}

export function Badge({ children, color = 'slate' }: { children: ReactNode; color?: 'slate' | 'emerald' | 'red' | 'amber' | 'blue' | 'violet' }) {
  const map = {
    slate: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300',
    emerald: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400',
    red: 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-400',
    amber: 'bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400',
    blue: 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-400',
    violet: 'bg-violet-100 dark:bg-violet-900/40 text-violet-700 dark:text-violet-400',
  }[color];
  return <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${map}`}>{children}</span>;
}

export function Spinner() {
  return <Loader2 className="h-5 w-5 animate-spin text-emerald-600 mx-auto" />;
}

export function ErrorNotice({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 text-sm text-red-700 dark:text-red-400">{message}</div>
  );
}

export function EmptyState({ icon, title, message }: { icon: ReactNode; title: string; message: string }) {
  return (
    <div className="text-center py-10">
      <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">{icon}</div>
      <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white transition-colors">{title}</h3>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 max-w-sm mx-auto transition-colors">{message}</p>
    </div>
  );
}

export function ScoreGauge({ score }: { score: number | null }) {
  const value = score ?? 0;
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (value / 100) * circumference;
  const color = value >= 70 ? '#059669' : value >= 40 ? '#f59e0b' : '#dc2626';

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="180" height="180" viewBox="0 0 180 180">
        <circle cx="90" cy="90" r={radius} fill="none" className="stroke-slate-200 dark:stroke-[#333] transition-colors" strokeWidth="14" />
        <circle
          cx="90"
          cy="90"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 90 90)"
          style={{ transition: 'stroke-dashoffset 0.8s ease' }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-4xl font-extrabold text-slate-900 dark:text-white transition-colors">{value}</span>
        <span className="text-xs font-medium text-slate-400 mt-1">out of 100</span>
      </div>
    </div>
  );
}

export function fmtMoney(v: number | null | undefined): string {
  if (v === null || v === undefined || Number.isNaN(Number(v))) return '—';
  return Number(v).toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 });
}

export function fmtCompactINR(v: number): string {
  if (v >= 10000000) return `₹${(v / 10000000).toFixed(2).replace(/\.00$/, '')} Cr`;
  if (v >= 100000) return `₹${(v / 100000).toFixed(2).replace(/\.00$/, '')} L`;
  if (v >= 1000) return `₹${(v / 1000).toFixed(0)}k`;
  return `₹${v}`;
}

export function fmtDate(v: string | null | undefined): string {
  if (!v) return '—';
  return new Date(v).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
}

export function fmtDateTime(v: string | null | undefined): string {
  if (!v) return '—';
  return new Date(v).toLocaleString(undefined, { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}