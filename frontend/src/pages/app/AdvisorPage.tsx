import { useCallback, useEffect, useRef, useState } from 'react';
import { Send, Sparkles, Bot, User, ShieldCheck } from 'lucide-react';
import { getAdvisorHistory, sendAdvisorMessage, AdvisorHistoryMessage } from '../../services/app.service';
import { apiErr } from '../../services/app.service';
import { Card, PageHeader, ErrorNotice } from '../../components/ui';

interface ChatEntry {
  id: string;
  sender: 'USER' | 'AI';
  text: string;
  createdAt: string;
}

function formatTime(dateStr?: string) {
  if (!dateStr) return new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
  const d = new Date(dateStr);
  return isNaN(d.getTime())
    ? new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })
    : d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
}

function formatInlineText(text: string, isUser: boolean) {
  const parts = text.split(/(\*\*.*?\*\*|\*.*?\*)/g);
  return parts.map((part, i) => {
    if ((part.startsWith('**') && part.endsWith('**')) || (part.startsWith('*') && part.endsWith('*'))) {
      const inner = part.startsWith('**') ? part.slice(2, -2) : part.slice(1, -1);
      return <strong key={i} className={`font-semibold ${isUser ? 'text-white' : 'text-slate-900'}`}>{inner}</strong>;
    }
    return part;
  });
}

function FormattedMessage({ text, sender }: { text: string; sender: 'USER' | 'AI' }) {
  const isUser = sender === 'USER';
  const lines = text.split('\n');

  return (
    <div className="space-y-1.5 leading-relaxed">
      {lines.map((line, idx) => {
        const trimmed = line.trim();
        if (!trimmed) return <div key={idx} className="h-1" />;

        if (trimmed.startsWith('#')) {
          const headerText = trimmed.replace(/^#+\s*/, '');
          return (
            <h4 key={idx} className={`font-bold text-sm mt-2 mb-1 ${isUser ? 'text-white' : 'text-slate-900'}`}>
              {formatInlineText(headerText, isUser)}
            </h4>
          );
        }

        if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
          const bulletText = trimmed.replace(/^[*•-]\s*/, '');
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className={`font-bold select-none ${isUser ? 'text-emerald-200' : 'text-emerald-600'}`}>•</span>
              <div>{formatInlineText(bulletText, isUser)}</div>
            </div>
          );
        }

        const numMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
        if (numMatch) {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className={`font-semibold ${isUser ? 'text-emerald-100' : 'text-emerald-700'}`}>{numMatch[1]}</span>
              <div>{formatInlineText(numMatch[2], isUser)}</div>
            </div>
          );
        }

        return (
          <p key={idx}>
            {formatInlineText(trimmed, isUser)}
          </p>
        );
      })}
    </div>
  );
}

export default function AdvisorPage() {
  const [entries, setEntries] = useState<ChatEntry[]>([]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  const load = useCallback(async () => {
    setError('');
    try {
      const history = await getAdvisorHistory();
      setEntries(
        history.map((m: AdvisorHistoryMessage) => ({
          id: String(m.id),
          sender: m.sender,
          text: m.text,
          createdAt: m.createdAt,
        }))
      );
    } catch (err) {
      setError(apiErr(err, 'Failed to load chat history'));
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length, sending]);

  const send = async () => {
    const text = input.trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    const optimistic: ChatEntry = { id: `u-${Date.now()}`, sender: 'USER', text, createdAt: new Date().toISOString() };
    setEntries((prev) => [...prev, optimistic]);
    setInput('');
    try {
      const reply = await sendAdvisorMessage(text);
      if (reply && reply.message) {
        setEntries((prev) => [
          ...prev,
          {
            id: String(reply.messageId || Date.now()),
            sender: 'AI',
            text: reply.message,
            createdAt: reply.createdAt || new Date().toISOString(),
          },
        ]);
      } else {
        await load();
      }
    } catch (err) {
      setError(apiErr(err, 'The advisor could not respond'));
      setEntries((prev) => [
        ...prev,
        { id: `e-${Date.now()}`, sender: 'AI', text: 'Sorry, I ran into an issue. Please try again.', createdAt: new Date().toISOString() },
      ]);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="h-[calc(100vh-9rem)] flex flex-col">
      <PageHeader title="WealthWise Advisor" subtitle="Ask anything about your money — budgeting, investing, big purchases." />

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-xs text-amber-800 flex items-start gap-2 mb-4">
        <ShieldCheck className="h-4 w-4 shrink-0 mt-0.5" />
        <span>
          <strong>Disclaimer:</strong> Advice here is AI-generated and informational only — not licensed financial advice. Verify important decisions independently before acting.
        </span>
      </div>

      <ErrorNotice message={error} />

      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {entries.length === 0 && !sending && (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900">Start a conversation</h3>
              <p className="mt-1 text-sm text-slate-500 max-w-md mx-auto">
                Ask about budgeting, saving for a goal, or whether to make a big purchase — the advisor has read your numbers.
              </p>
            </div>
          )}

          {entries.map((e) => (
            <div key={e.id} className={`flex gap-3 ${e.sender === 'AI' ? '' : 'flex-row-reverse'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${e.sender === 'AI' ? 'bg-emerald-600 text-white' : 'bg-slate-200 text-slate-600'}`}>
                {e.sender === 'AI' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${e.sender === 'AI' ? 'bg-slate-100 text-slate-800' : 'bg-emerald-600 text-white'}`}>
                <FormattedMessage text={e.text} sender={e.sender} />
                <p className={`mt-1 text-[10px] ${e.sender === 'AI' ? 'text-slate-400' : 'text-emerald-100'}`}>
                  {formatTime(e.createdAt)}
                </p>
              </div>
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-100 text-slate-500 rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
                <span className="animate-pulse font-medium">Advisor is analyzing your request...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-200 p-3">
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  send();
                }
              }}
              placeholder="Ask the advisor…"
              rows={1}
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm"
            />
            <button
              onClick={send}
              disabled={sending || !input.trim()}
              className="h-11 w-11 shrink-0 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 disabled:opacity-40 disabled:cursor-not-allowed"
              aria-label="Send"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
            <Sparkles className="h-3 w-3" />
            Powered by AI · press Enter to send
          </p>
        </div>
      </Card>
    </div>
  );
}