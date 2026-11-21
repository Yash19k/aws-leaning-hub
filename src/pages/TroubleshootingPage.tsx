import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, ClipboardPaste, Lightbulb, ListOrdered, TerminalSquare, Wrench, X } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NextUp } from '@/components/project/NextUp';
import { cn } from '@/lib/cn';
import { getProject, troubleshootingItems } from '@/lib/content';
import { useDebounced, useReducedMotion } from '@/lib/hooks';
import { inline } from '@/lib/markdown';
import { usePageMeta } from '@/lib/meta';
import type { TroubleshootingItem } from '@/lib/types';

const STOP = new Set(['the', 'a', 'an', 'to', 'of', 'and', 'or', 'is', 'in', 'on', 'for', 'when', 'calling', 'operation', 'error', 'an', 'occurred', 'not', 'with', 'you', 'your', 'be', 'by', 'this', 'that', 'at', 'from', 'are', 'was']);

function tokens(s: string): string[] {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9_.$-]+/g, ' ')
    .split(' ')
    .filter((t) => t.length > 2 && !STOP.has(t) && !/^\d+$/.test(t));
}

/** Score how well a pasted error matches an item: share of the item's distinctive words found in the paste. */
function score(item: TroubleshootingItem, query: string): number {
  const q = query.toLowerCase();
  const qTokens = new Set(tokens(query));
  if (!qTokens.size) return 0;
  const itemTokens = [...new Set(tokens(`${item.errorMessage} ${(item.keywords ?? []).join(' ')}`))];
  const hits = itemTokens.filter((t) => qTokens.has(t)).length;
  let s = itemTokens.length ? hits / Math.min(itemTokens.length, 8) : 0;
  if (item.errorMessage.toLowerCase().includes(q.trim()) || q.includes(item.errorMessage.toLowerCase().slice(0, 40))) s += 1;
  if (`${item.title} ${(item.keywords ?? []).join(' ')}`.toLowerCase().includes(q.trim())) s += 0.6;
  return s;
}

function Item({ item, open, onToggle }: { item: TroubleshootingItem; open: boolean; onToggle: () => void }) {
  const reduced = useReducedMotion();
  return (
    <li id={item.id} className={cn('card-base scroll-mt-28 overflow-hidden transition-colors', open && 'border-brand-400')}>
      <button type="button" onClick={onToggle} aria-expanded={open} className="flex w-full items-start gap-4 p-5 text-left">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-200">
          <Wrench className="h-5 w-5" aria-hidden="true" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-lg font-bold leading-snug text-ink">{item.title}</span>
          <code className="mt-1.5 block truncate rounded-lg bg-surface-2 px-2 py-1 font-mono text-xs text-rose-700 dark:text-rose-300">
            {item.errorMessage}
          </code>
        </span>
        <ChevronDown className={cn('mt-1 h-5 w-5 shrink-0 text-muted transition-transform', open && 'rotate-180')} aria-hidden="true" />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div initial={reduced ? false : { height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={reduced ? undefined : { height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="space-y-5 border-t border-line px-5 pb-5 pt-4">
              <div>
                <p className="mb-1 flex items-center gap-2 text-sm font-bold text-muted">
                  <TerminalSquare className="h-4 w-4" aria-hidden="true" /> The exact error
                </p>
                <pre className="overflow-x-auto whitespace-pre-wrap rounded-xl bg-[#0B1424] px-4 py-3 font-mono text-xs leading-5 text-rose-200">{item.errorMessage}</pre>
              </div>
              <div>
                <p className="mb-1 flex items-center gap-2 text-sm font-bold text-muted">
                  <Lightbulb className="h-4 w-4" aria-hidden="true" /> What it means
                </p>
                <p className="leading-relaxed text-ink/90">{inline(item.cause)}</p>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-2 text-sm font-bold text-muted">
                  <ListOrdered className="h-4 w-4" aria-hidden="true" /> How to fix it
                </p>
                <ol className="space-y-2">
                  {item.fix.map((f, i) => (
                    <li key={i} className="flex gap-3">
                      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-xs font-extrabold text-navy-950">{i + 1}</span>
                      <span className="leading-relaxed text-ink/90">{inline(f)}</span>
                    </li>
                  ))}
                </ol>
              </div>
              {item.relatedProjects.length > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs font-bold text-muted">Happens in:</span>
                  {item.relatedProjects.map((p) => (
                    <Link key={p} to={`/projects/${p}/build`} className="rounded-lg border border-line px-2 py-1 text-xs font-bold text-ink hover:border-brand-400">
                      {getProject(p)?.title.split(':')[0] ?? p}
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </li>
  );
}

export default function TroubleshootingPage() {
  usePageMeta('Troubleshooting', 'Paste an AWS error message to find what it means and how to fix it.');
  const [text, setText] = useState('');
  const query = useDebounced(text, 120);
  const { hash } = useLocation();
  const [open, setOpen] = useState<string | null>(hash ? hash.slice(1) : null);
  useEffect(() => {
    if (hash) setOpen(hash.slice(1));
  }, [hash]);

  const results = useMemo(() => {
    if (!query.trim()) return troubleshootingItems.map((item) => ({ item, s: 1 }));
    return troubleshootingItems
      .map((item) => ({ item, s: score(item, query) }))
      .filter((r) => r.s > 0.15)
      .sort((a, b) => b.s - a.s);
  }, [query]);

  useEffect(() => {
    if (query.trim() && results[0]) setOpen(results[0].item.id);
  }, [query, results]);

  const paste = async () => {
    try {
      setText(await navigator.clipboard.readText());
    } catch {
      /* clipboard read blocked: the user can paste manually */
    }
  };

  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ label: 'Troubleshooting' }]} />
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-2">Stuck?</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Paste your error</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Copy the red text from your terminal or browser console and paste it below. We will match it to errors beginners hit
          all the time, explain it in plain words and show the fix.
        </p>
      </header>

      <div className="relative mb-10 max-w-3xl">
        <label htmlFor="error-input" className="sr-only">Paste your error message</label>
        <textarea
          id="error-input"
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={4}
          placeholder={'e.g. An error occurred (AccessDenied) when calling the PutObject operation: Access Denied'}
          className="w-full resize-y rounded-2xl border-2 border-line bg-[#0B1424] p-4 pr-28 font-mono text-sm text-[#DCE4F2] shadow-soft outline-none placeholder:text-white/35 focus:border-brand-400"
        />
        <div className="absolute right-3 top-3 flex gap-1">
          {text ? (
            <button type="button" onClick={() => setText('')} className="flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold text-white hover:bg-white/20">
              <X className="h-3.5 w-3.5" aria-hidden="true" /> Clear
            </button>
          ) : (
            <button type="button" onClick={paste} className="flex h-9 items-center gap-1.5 rounded-lg bg-white/10 px-3 text-xs font-bold text-white hover:bg-white/20">
              <ClipboardPaste className="h-3.5 w-3.5" aria-hidden="true" /> Paste
            </button>
          )}
        </div>
        <p className="mt-2 text-sm text-muted" aria-live="polite">
          {query.trim()
            ? results.length
              ? `Best match first. ${results.length} possible match${results.length === 1 ? '' : 'es'}.`
              : 'No match yet. Try pasting just the first line of the error.'
            : `${troubleshootingItems.length} common errors below.`}
        </p>
      </div>

      <ul className="space-y-3">
        {results.map(({ item }) => (
          <Item key={item.id} item={item} open={open === item.id} onToggle={() => setOpen(open === item.id ? null : item.id)} />
        ))}
      </ul>

      <NextUp
        items={[
          { to: '/faq', title: 'Read the FAQ', description: 'Billing, safety and learning questions.' },
          { to: '/setup/configure-aws-cli', title: 'Re-check your CLI setup', description: 'Most errors start with credentials or region.' },
        ]}
      />
    </div>
  );
}
