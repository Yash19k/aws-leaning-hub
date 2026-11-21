import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, Circle, RotateCcw, Trophy } from 'lucide-react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import { guides, projects } from '@/lib/content';
import { buildGuideId, resetProgress, setupGuideId, useProgress } from '@/lib/progress';

export function ProgressSummary({ onNavigate }: { onNavigate?: () => void }) {
  const completed = useProgress((s) => s.guidesCompleted);
  const badges = useProgress((s) => Object.keys(s.badges).length);
  const setupDone = guides.filter((g) => completed[setupGuideId(g.slug)]).length;
  const [confirm, setConfirm] = useState(false);

  return (
    <div>
      <ProgressBar value={setupDone} max={guides.length} label="Setup guides" showValue />
      <ul className="mt-3 max-h-48 space-y-1 overflow-y-auto pr-1">
        {guides.map((g) => {
          const done = !!completed[setupGuideId(g.slug)];
          return (
            <li key={g.slug}>
              <Link
                to={`/setup/${g.slug}`}
                onClick={onNavigate}
                className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-ink hover:bg-surface-2"
              >
                {done ? (
                  <CheckCircle2 className="h-4 w-4 shrink-0 text-teal-600" aria-label="done" />
                ) : (
                  <Circle className="h-4 w-4 shrink-0 text-muted" aria-label="not done" />
                )}
                <span className={cn('truncate', done && 'text-muted line-through decoration-teal-500/60')}>{g.title}</span>
              </Link>
            </li>
          );
        })}
      </ul>
      <p className="mb-1.5 mt-4 text-xs font-bold uppercase tracking-wider text-muted">Projects built</p>
      <ul className="space-y-1">
        {projects.map((p) => {
          const done = !!completed[buildGuideId(p.slug)];
          return (
            <li key={p.slug}>
              <Link to={`/projects/${p.slug}/build`} onClick={onNavigate} className="flex items-center gap-2 rounded-lg px-2 py-1 text-sm text-ink hover:bg-surface-2">
                {done ? <CheckCircle2 className="h-4 w-4 text-teal-600" aria-label="built" /> : <Circle className="h-4 w-4 text-muted" aria-label="not built" />}
                {p.title.split(':')[0]}
              </Link>
            </li>
          );
        })}
      </ul>
      <div className="mt-4 flex items-center justify-between gap-2 border-t border-line pt-3">
        <Link to="/progress" onClick={onNavigate} className="inline-flex items-center gap-1.5 text-sm font-bold text-link">
          <Trophy className="h-4 w-4" aria-hidden="true" /> {badges} badge{badges === 1 ? '' : 's'}
        </Link>
        <button type="button" onClick={() => setConfirm(true)} className="inline-flex items-center gap-1.5 text-xs font-bold text-muted hover:text-rose-600">
          <RotateCcw className="h-3.5 w-3.5" aria-hidden="true" /> Reset progress
        </button>
      </div>
      <ConfirmDialog
        open={confirm}
        title="Reset all progress?"
        confirmLabel="Reset"
        danger
        onCancel={() => setConfirm(false)}
        onConfirm={() => {
          resetProgress();
          setConfirm(false);
        }}
      >
        This clears every ticked step, finished guide, quiz answer and badge saved in this browser. It cannot be undone.
      </ConfirmDialog>
    </div>
  );
}

/** Navbar button + dropdown with "Your progress". */
export function ProgressMenu() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const setupDone = useProgress((s) => guides.filter((g) => s.guidesCompleted[setupGuideId(g.slug)]).length);
  const pct = Math.round((setupDone / guides.length) * 100);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        aria-haspopup="true"
        className="flex h-10 items-center gap-2 rounded-xl px-2.5 text-sm font-bold text-ink transition-colors hover:bg-surface-2"
      >
        <span className="relative flex h-7 w-7 items-center justify-center">
          <svg viewBox="0 0 36 36" className="absolute inset-0 -rotate-90" aria-hidden="true">
            <circle cx="18" cy="18" r="15" fill="none" stroke="rgb(var(--border))" strokeWidth="4" />
            <circle
              cx="18"
              cy="18"
              r="15"
              fill="none"
              stroke="#FF9900"
              strokeWidth="4"
              strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 94.2} 94.2`}
            />
          </svg>
          <Trophy className="h-3.5 w-3.5" aria-hidden="true" />
        </span>
        <span className="hidden xl:inline">Your progress</span>
        <span className="sr-only xl:hidden">Your progress, {pct}% of setup done</span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.14 }}
            className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-line bg-surface p-4 shadow-lift"
          >
            <p className="mb-3 font-bold">Your progress</p>
            <ProgressSummary onNavigate={() => setOpen(false)} />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
