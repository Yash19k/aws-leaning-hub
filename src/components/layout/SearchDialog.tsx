import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type Fuse from 'fuse.js';
import { AnimatePresence, motion } from 'framer-motion';
import {
  BookOpen,
  Boxes,
  CircleHelp,
  CornerDownLeft,
  FileText,
  FolderGit2,
  ListChecks,
  Search,
  Wrench,
  type LucideIcon,
} from 'lucide-react';
import { createPortal } from 'react-dom';
import { Kbd } from '@/components/ui/Kbd';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks';
import { KIND_LABEL, loadSearchIndex, type SearchEntry, type SearchKind } from '@/lib/search';

const KIND_ICON: Record<SearchKind, LucideIcon> = {
  project: FolderGit2,
  node: Boxes,
  service: BookOpen,
  guide: ListChecks,
  step: ListChecks,
  faq: CircleHelp,
  error: Wrench,
  page: FileText,
};

const SUGGESTIONS = ['presigned URL', 'WebSocket', 'billing alarm', 'Access Denied', 'DynamoDB'];

export function SearchDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [query, setQuery] = useState('');
  const [fuse, setFuse] = useState<Fuse<SearchEntry> | null>(null);
  const [active, setActive] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const navigate = useNavigate();
  const reduced = useReducedMotion();

  useEffect(() => {
    if (!open) return;
    loadSearchIndex().then(setFuse);
    const prev = document.activeElement as HTMLElement | null;
    const t = window.setTimeout(() => inputRef.current?.focus(), 20);
    const { overflow } = document.body.style;
    document.body.style.overflow = 'hidden';
    return () => {
      window.clearTimeout(t);
      document.body.style.overflow = overflow;
      prev?.focus?.();
    };
  }, [open]);

  const results = useMemo(() => {
    if (!fuse || query.trim().length < 2) return [];
    return fuse.search(query.trim(), { limit: 12 }).map((r) => r.item);
  }, [fuse, query]);

  useEffect(() => setActive(0), [query]);

  const go = (entry: SearchEntry | undefined) => {
    if (!entry) return;
    onClose();
    setQuery('');
    navigate(entry.href);
  };

  const onKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActive((a) => Math.min(results.length - 1, a + 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      go(results[active]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  useEffect(() => {
    listRef.current?.querySelector(`[data-index="${active}"]`)?.scrollIntoView({ block: 'nearest' });
  }, [active]);

  return createPortal(
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[90] flex items-start justify-center px-3 pt-[8vh] sm:pt-[12vh]" role="presentation">
          <motion.div
            className="absolute inset-0 bg-navy-950/55 backdrop-blur-[2px]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label="Search the site"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.16 }}
            className="relative w-full max-w-xl overflow-hidden rounded-3xl border border-line bg-surface shadow-lift"
          >
            <div className="flex items-center gap-3 border-b border-line px-4">
              <Search className="h-5 w-5 shrink-0 text-muted" aria-hidden="true" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={onKey}
                placeholder="Search projects, services, guides, errors..."
                className="h-14 min-w-0 flex-1 bg-transparent text-base font-semibold text-ink outline-none placeholder:font-normal placeholder:text-muted"
                aria-label="Search"
                aria-controls="search-results"
                aria-activedescendant={results[active] ? `sr-${active}` : undefined}
                role="combobox"
                aria-expanded={results.length > 0}
              />
              <Kbd className="hidden sm:inline-flex">Esc</Kbd>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-2">
              {query.trim().length < 2 ? (
                <div className="p-3">
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Try searching for</p>
                  <div className="flex flex-wrap gap-2">
                    {SUGGESTIONS.map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setQuery(s)}
                        className="rounded-xl border border-line bg-surface-2 px-3 py-1.5 text-sm font-semibold text-ink hover:border-brand-400"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              ) : results.length === 0 ? (
                <p className="p-6 text-center text-muted">{fuse ? `No results for "${query}".` : 'Loading the index...'}</p>
              ) : (
                <ul id="search-results" ref={listRef} role="listbox" aria-label="Results">
                  {results.map((r, i) => {
                    const IconC = KIND_ICON[r.kind];
                    return (
                      <li key={r.id} id={`sr-${i}`} role="option" aria-selected={i === active} data-index={i}>
                        <button
                          type="button"
                          onClick={() => go(r)}
                          onMouseMove={() => setActive(i)}
                          className={cn(
                            'flex w-full items-start gap-3 rounded-2xl px-3 py-2.5 text-left',
                            i === active ? 'bg-brand-50 dark:bg-brand-900/25' : 'hover:bg-surface-2',
                          )}
                        >
                          <span
                            className={cn(
                              'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg',
                              i === active ? 'bg-brand-500 text-navy-950' : 'bg-surface-2 text-muted',
                            )}
                          >
                            <IconC className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold text-ink">{r.title}</span>
                            <span className="block truncate text-xs text-muted">
                              <span className="font-semibold">{KIND_LABEL[r.kind]}</span> · {r.subtitle}
                            </span>
                          </span>
                          {i === active && <CornerDownLeft className="mt-2 h-4 w-4 shrink-0 text-muted" aria-hidden="true" />}
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
