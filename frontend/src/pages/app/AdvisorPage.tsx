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
      return <strong key={i} className={`font-semibold ${isUser ? 'text-white' : 'text-slate-900 dark:text-white dark:text-white transition-colors'}`}>{inner}</strong>;
    }
    return part;
  });
}

function FormattedMessage({ text, sender }: { text: string; sender: 'USER' | 'AI' }) {
  const isUser = sender === 'USER';
  const lines = text.split('\n');

  // Group lines into blocks (paragraphs, tables, lists, quotes)
  const blocks: { type: 'header' | 'bullet' | 'number' | 'table' | 'quote' | 'hr' | 'paragraph'; content: any }[] = [];
  let currentTable: string[] = [];

  for (let i = 0; i < lines.length; i++) {
    const trimmed = lines[i].trim();

    if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
      currentTable.push(trimmed);
      continue;
    } else if (currentTable.length > 0) {
      blocks.push({ type: 'table', content: [...currentTable] });
      currentTable = [];
    }

    if (!trimmed) {
      blocks.push({ type: 'paragraph', content: '' });
      continue;
    }

    if (trimmed === '---') {
      blocks.push({ type: 'hr', content: '' });
    } else if (trimmed.startsWith('#')) {
      blocks.push({ type: 'header', content: trimmed.replace(/^#+\s*/, '') });
    } else if (trimmed.startsWith('>')) {
      blocks.push({ type: 'quote', content: trimmed.replace(/^>\s*/, '') });
    } else if (trimmed.startsWith('* ') || trimmed.startsWith('- ') || trimmed.startsWith('• ')) {
      blocks.push({ type: 'bullet', content: trimmed.replace(/^[*•-]\s*/, '') });
    } else {
      const numMatch = trimmed.match(/^(\d+\.)\s*(.*)/);
      if (numMatch) {
        blocks.push({ type: 'number', content: { num: numMatch[1], text: numMatch[2] } });
      } else {
        blocks.push({ type: 'paragraph', content: trimmed });
      }
    }
  }

  if (currentTable.length > 0) {
    blocks.push({ type: 'table', content: [...currentTable] });
  }

  return (
    <div className="space-y-1.5 leading-relaxed text-sm">
      {blocks.map((block, idx) => {
        if (block.type === 'paragraph') {
          if (!block.content) return <div key={idx} className="h-1" />;
          return (
            <p key={idx} className={isUser ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>
              {formatInlineText(block.content, isUser)}
            </p>
          );
        }

        if (block.type === 'header') {
          return (
            <h4 key={idx} className={`font-bold text-sm mt-3 mb-1.5 flex items-center gap-1.5 ${isUser ? 'text-white' : 'text-slate-900 dark:text-white'}`}>
              {formatInlineText(block.content, isUser)}
            </h4>
          );
        }

        if (block.type === 'hr') {
          return <hr key={idx} className="my-3 border-slate-200 dark:border-slate-700" />;
        }

        if (block.type === 'quote') {
          return (
            <div key={idx} className="border-l-2 border-emerald-500 pl-3 py-1 my-2 bg-emerald-50/60 dark:bg-emerald-950/30 rounded-r-md text-xs italic text-slate-700 dark:text-slate-300">
              {formatInlineText(block.content, isUser)}
            </div>
          );
        }

        if (block.type === 'bullet') {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className={`font-bold select-none ${isUser ? 'text-emerald-200' : 'text-emerald-600'}`}>•</span>
              <div className={isUser ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>
                {formatInlineText(block.content, isUser)}
              </div>
            </div>
          );
        }

        if (block.type === 'number') {
          return (
            <div key={idx} className="flex items-start gap-2 ml-1">
              <span className={`font-semibold shrink-0 ${isUser ? 'text-emerald-100' : 'text-emerald-700'}`}>{block.content.num}</span>
              <div className={isUser ? 'text-white' : 'text-slate-800 dark:text-slate-200'}>
                {formatInlineText(block.content.text, isUser)}
              </div>
            </div>
          );
        }

        if (block.type === 'table') {
          const rows = block.content.map((rowStr: string) =>
            rowStr
              .split('|')
              .slice(1, -1)
              .map((cell) => cell.trim())
          );
          if (rows.length < 2) return null;
          const header = rows[0];
          // skip separator row if exists (e.g. :---)
          const dataRows = rows.slice(1).filter((r: string[]) => !r.every((c: string) => /^:?-+:?$/.test(c)));

          return (
            <div key={idx} className="my-3 overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/60 shadow-xs">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 font-semibold">
                  <tr>
                    {header.map((col: string, cIdx: number) => (
                      <th key={cIdx} className="px-3 py-2">
                        {formatInlineText(col, false)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                  {dataRows.map((r: string[], rIdx: number) => (
                    <tr key={rIdx} className="hover:bg-slate-50 dark:hover:bg-slate-800/40">
                      {r.map((c: string, cIdx: number) => (
                        <td key={cIdx} className="px-3 py-2 text-slate-700 dark:text-slate-300">
                          {formatInlineText(c, false)}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          );
        }

        return null;
      })}
    </div>
  );
}

function AIMessageBubble({ text, createdAt }: { text: string; createdAt: string }) {
  const [activeTab, setActiveTab] = useState<'final' | 'compare' | 'full'>('final');
  const isMultiAI = text.includes('Multi-AI Comparative Advisory Breakdown');

  // Split text into final synthesized suggestion and comparative breakdown
  let finalPart = text;
  let comparePart = '';

  if (isMultiAI) {
    const splitIndex = text.indexOf('---');
    if (splitIndex !== -1) {
      finalPart = text.slice(0, splitIndex).trim();
      comparePart = text.slice(splitIndex + 3).trim();
    }
  }

  return (
    <div className="max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
      {isMultiAI && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Multi-AI Consensus Engine Active (2 Models Evaluated)</span>
          </div>

          <div className="flex items-center gap-1 bg-white dark:bg-slate-900 rounded-lg p-0.5 border border-slate-200 dark:border-slate-700 text-[11px]">
            <button
              onClick={() => setActiveTab('final')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'final'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              🌟 Final Suggestion
            </button>
            <button
              onClick={() => setActiveTab('compare')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'compare'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              ⚖️ Model Comparison
            </button>
            <button
              onClick={() => setActiveTab('full')}
              className={`px-2 py-1 rounded-md font-medium transition-colors ${
                activeTab === 'full'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Full
            </button>
          </div>
        </div>
      )}

      {/* Content based on tab */}
      <div>
        {activeTab === 'final' && <FormattedMessage text={finalPart} sender="AI" />}
        {activeTab === 'compare' && comparePart && <FormattedMessage text={comparePart} sender="AI" />}
        {(activeTab === 'full' || (!comparePart && activeTab === 'compare')) && (
          <FormattedMessage text={text} sender="AI" />
        )}
      </div>

      <p className="pt-1 text-[10px] text-slate-400 dark:text-slate-500 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between">
        <span>AI Generated Advisory</span>
        <span>{formatTime(createdAt)}</span>
      </p>
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

  const send = async (explicitText?: string) => {
    const text = (explicitText !== undefined ? explicitText : input).trim();
    if (!text || sending) return;
    setSending(true);
    setError('');
    const optimistic: ChatEntry = { id: `u-${Date.now()}`, sender: 'USER', text, createdAt: new Date().toISOString() };
    setEntries((prev) => [...prev, optimistic]);
    if (explicitText === undefined) setInput('');
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

      <div className="bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 text-xs text-amber-800 dark:text-amber-400 flex items-start gap-2 mb-4">
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
              <div className="mx-auto h-12 w-12 rounded-full bg-emerald-50 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Bot className="h-6 w-6" />
              </div>
              <h3 className="mt-3 text-sm font-semibold text-slate-900 dark:text-white dark:text-white">Start a conversation</h3>
              <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 dark:text-slate-400 max-w-md mx-auto">
                Ask about budgeting, saving for a goal, or whether to make a big purchase — the advisor has read your numbers.
              </p>
            </div>
          )}

          {entries.map((e) => (
            <div key={e.id} className={`flex gap-3 ${e.sender === 'AI' ? '' : 'flex-row-reverse'}`}>
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${e.sender === 'AI' ? 'bg-emerald-600 text-white' : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'}`}>
                {e.sender === 'AI' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
              </div>
              {e.sender === 'AI' ? (
                <AIMessageBubble text={e.text} createdAt={e.createdAt} />
              ) : (
                <div className="max-w-[75%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed bg-emerald-600 text-white">
                  <FormattedMessage text={e.text} sender={e.sender} />
                  <p className="mt-1 text-[10px] text-emerald-100">
                    {formatTime(e.createdAt)}
                  </p>
                </div>
              )}
            </div>
          ))}

          {sending && (
            <div className="flex gap-3">
              <div className="h-8 w-8 rounded-full bg-emerald-600 text-white flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 dark:text-slate-400 rounded-2xl px-4 py-2.5 text-sm flex items-center gap-2">
                <span className="animate-pulse font-medium">Advisor is analyzing your request...</span>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div className="border-t border-slate-200 dark:border-slate-800 p-3 bg-slate-50/50 dark:bg-slate-900/50 transition-colors">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              'How should I manage my finances?',
              'Give me an overall review of my finance',
              'Where should I invest my monthly surplus?',
              'How is my emergency fund looking?',
              'How can I save tax under Section 80C and 80D?',
            ].map((q, idx) => (
              <button
                key={idx}
                onClick={() => send(q)}
                disabled={sending}
                className="text-xs whitespace-nowrap px-3 py-1.5 rounded-full bg-white dark:bg-[#1A1A1A] border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:border-emerald-500 dark:hover:border-emerald-500 hover:text-emerald-700 dark:hover:text-emerald-500 transition-colors shadow-sm disabled:opacity-50"
              >
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2 pt-1">
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
              className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-[#1A1A1A] text-slate-900 dark:text-white dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 resize-none text-sm transition-colors"
            />
            <button
              onClick={() => send()}
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
