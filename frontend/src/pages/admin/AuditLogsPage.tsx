import { useCallback, useEffect, useState } from 'react';
import { Search, Download, ScrollText, ChevronLeft, ChevronRight, FileJson } from 'lucide-react';
import { getAuditLogs, exportAuditLogs, AuditLog } from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, Button, Badge, ErrorNotice, fmtDateTime } from '../../components/ui';

function actionBadge(action: string) {
  const a = action.toLowerCase();
  if (a.startsWith('create') || a.startsWith('register') || a.startsWith('login')) return <Badge color="emerald">{action}</Badge>;
  if (a.startsWith('delete')) return <Badge color="red">{action}</Badge>;
  if (a.startsWith('update') || a.startsWith('change') || a.startsWith('logout') || a.startsWith('resolve') || a.startsWith('mark')) return <Badge color="amber">{action}</Badge>;
  return <Badge color="slate">{action}</Badge>;
}

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async (pageNum: number, srch: string, act: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await getAuditLogs({ search: srch || undefined, action: act || undefined, page: pageNum, limit: 25 });
      setLogs(res.logs);
      setTotal(res.pagination.total);
      setTotalPages(res.pagination.totalPages);
    } catch (err) {
      setError(apiErr(err, 'Failed to load audit logs'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load(page, search, actionFilter);
  }, [load, page, search, actionFilter]);

  const applySearch = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const download = async (format: 'csv' | 'json') => {
    setError('');
    try {
      const result = await exportAuditLogs(format);
      const blob = new Blob([String(result.data)], { type: format === 'csv' ? 'text/csv' : 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs.${format}`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      setError(apiErr(err, 'Export failed'));
    }
  };

  const actions = Array.from(new Set(logs.map((l) => l.action))).sort();

  return (
    <div>
      <PageHeader
        title="Audit Logs"
        subtitle="Every important action across the platform, in one stream."
        actions={
          <>
            <Button variant="secondary" onClick={() => download('csv')}>
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
            <Button variant="secondary" onClick={() => download('json')}>
              <FileJson className="h-4 w-4" />
              Export JSON
            </Button>
          </>
        }
      />

      <ErrorNotice message={error} />

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="flex-1 flex gap-2">
          <div className="relative flex-1">
            <Search className="h-4 w-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && applySearch()}
              placeholder="Search by actor, action, or resource…"
              className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
          </div>
          <Button variant="secondary" onClick={applySearch}>
            Search
          </Button>
        </div>
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value);
            setPage(1);
          }}
          className="px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm bg-white"
        >
          <option value="">All actions</option>
          {actions.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-sm text-slate-400 animate-pulse">Loading logs…</div>
        ) : logs.length === 0 ? (
          <div className="py-16 text-center">
            <div className="mx-auto h-12 w-12 rounded-full bg-slate-100 flex items-center justify-center text-slate-400">
              <ScrollText className="h-6 w-6" />
            </div>
            <h3 className="mt-3 text-sm font-semibold text-slate-900">No logs found</h3>
            <p className="mt-1 text-sm text-slate-500">Try a different search or clear the filters.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-left text-xs uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 font-medium">Action</th>
                  <th className="px-5 py-3 font-medium">Actor</th>
                  <th className="px-5 py-3 font-medium">Resource</th>
                  <th className="px-5 py-3 font-medium">IP Address</th>
                  <th className="px-5 py-3 font-medium">Timestamp</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {logs.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="px-5 py-3">{actionBadge(l.action)}</td>
                    <td className="px-5 py-3">
                      <div>
                        <p className="font-medium text-slate-800">{l.actorName}</p>
                        <p className="text-xs text-slate-400">{l.actorEmail}</p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {l.resourceType || '—'}
                      {l.resourceId != null && <span className="text-slate-400"> #{l.resourceId}</span>}
                    </td>
                    <td className="px-5 py-3 text-slate-500 font-mono text-xs">{l.ipAddress || '—'}</td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{fmtDateTime(l.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <div className="mt-4 flex items-center justify-between text-sm">
        <p className="text-slate-500">
          {total} log{total === 1 ? '' : 's'} · page {page} of {Math.max(1, totalPages)}
        </p>
        <div className="flex gap-2">
          <Button variant="secondary" disabled={page <= 1} onClick={() => setPage(page - 1)}>
            <ChevronLeft className="h-4 w-4" />
            Prev
          </Button>
          <Button variant="secondary" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>
            Next
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}