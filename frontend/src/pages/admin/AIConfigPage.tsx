import { useCallback, useEffect, useState } from 'react';
import { Cpu, KeyRound, RefreshCw, CheckCircle2 } from 'lucide-react';
import { getAiConfig, updateAiConfig, AiConfig } from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, Button, Badge, ErrorNotice } from '../../components/ui';

export default function AIConfigPage() {
  const [config, setConfig] = useState<AiConfig | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);

  const load = useCallback(async () => {
    setError('');
    try {
      setConfig(await getAiConfig());
    } catch (err) {
      setError(apiErr(err, 'Failed to load AI configuration'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const switchProvider = async (provider: string) => {
    setSaving(true);
    setError('');
    setNotice('');
    try {
      await updateAiConfig(provider);
      setNotice(`AI provider switched to ${provider}.`);
      await load();
    } catch (err) {
      setError(apiErr(err, 'Failed to switch provider'));
    } finally {
      setSaving(false);
    }
  };

  const healthCheck = async () => {
    setTesting(true);
    setError('');
    setNotice('');
    try {
      await getAiConfig();
      setNotice('Configuration reloaded — check the health badge below.');
    } catch (err) {
      setError(apiErr(err, 'Health check failed'));
    } finally {
      setTesting(false);
    }
  };

  return (
    <div>
      <PageHeader title="AI Provider" subtitle="Choose the engine that powers all AI features." />

      <ErrorNotice message={error} />
      {notice && <div className="bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-3 text-sm text-emerald-700 mb-4">{notice}</div>}

      <Card className="p-6">
        <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2 mb-5">
          <Cpu className="h-4 w-4 text-emerald-600" />
          Active Provider
        </h3>
        {!config ? (
          <p className="text-sm text-slate-400 animate-pulse">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {config.availableProviders.map((p) => {
              const isActive = p.name === config.currentProvider;
              return (
                <div
                  key={p.name}
                  className={`rounded-2xl border p-5 ${
                    isActive ? 'border-emerald-600 ring-2 ring-emerald-600/20 bg-emerald-50/40' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Cpu className="h-4 w-4 text-slate-500" />
                      <span className="font-bold text-slate-900 capitalize">{p.name}</span>
                    </div>
                    {isActive && <Badge color="emerald">Active</Badge>}
                  </div>
                  <div className="mt-3 flex items-center gap-2 text-sm text-slate-600">
                    <KeyRound className="h-3.5 w-3.5 text-slate-400" />
                    {p.apiKeyConfigured ? (
                      <span>
                        API key set · <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">{p.apiKeyMasked}</code>
                      </span>
                    ) : (
                      <span className="text-amber-600">No API key configured in the backend environment</span>
                    )}
                  </div>
                  <Button
                    className="mt-4"
                    variant={isActive ? 'secondary' : 'primary'}
                    disabled={isActive || saving}
                    onClick={() => switchProvider(p.name)}
                  >
                    {isActive ? 'In use' : saving ? 'Switching…' : `Switch to ${p.name}`}
                  </Button>
                </div>
              );
            })}
          </div>
        )}
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Health check</h3>
          {config?.healthCheck && (
            <div className="flex items-center gap-3">
              {config.healthCheck.reachable ? (
                <>
                  <CheckCircle2 className="h-8 w-8 text-emerald-500" />
                  <div>
                    <p className="text-sm font-medium text-slate-800">
                      {config.healthCheck.provider} is ready
                    </p>
                    <p className="text-xs text-slate-500">Provider selected and API key present.</p>
                  </div>
                </>
              ) : (
                <>
                  <span className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center text-lg font-bold">!</span>
                  <div>
                    <p className="text-sm font-medium text-slate-800">Provider not reachable</p>
                    <p className="text-xs text-slate-500">Add the API key for this provider to the backend environment.</p>
                  </div>
                </>
              )}
            </div>
          )}
          <Button className="mt-4" variant="secondary" onClick={healthCheck} disabled={testing}>
            <RefreshCw className={`h-4 w-4 ${testing ? 'animate-spin' : ''}`} />
            {testing ? 'Checking…' : 'Run health check'}
          </Button>
        </Card>
      </div>
    </div>
  );
}