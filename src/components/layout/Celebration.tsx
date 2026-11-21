import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { badgeCatalog, onBadgesEarned } from '@/lib/badges';
import { useReducedMotion } from '@/lib/hooks';

const CONFETTI_COLORS = ['#FF9900', '#14B09F', '#8B5CF6', '#3B6FE0', '#E5484D', '#FFC04D'];

function Confetti() {
  const pieces = useMemo(
    () =>
      Array.from({ length: 26 }, (_, i) => ({
        id: i,
        x: (Math.random() - 0.5) * 320,
        y: -80 - Math.random() * 160,
        r: Math.random() * 540 - 270,
        c: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        w: 6 + Math.random() * 6,
        d: 0.9 + Math.random() * 0.6,
      })),
    [],
  );
  return (
    <div className="pointer-events-none absolute left-1/2 top-1/2" aria-hidden="true">
      {pieces.map((p) => (
        <motion.span
          key={p.id}
          className="absolute block rounded-[2px]"
          style={{ width: p.w, height: p.w * 0.45, backgroundColor: p.c }}
          initial={{ x: 0, y: 0, rotate: 0, opacity: 1 }}
          animate={{ x: p.x, y: [0, p.y, p.y + 220], rotate: p.r, opacity: [1, 1, 0] }}
          transition={{ duration: p.d * 1.6, ease: 'easeOut' }}
        />
      ))}
    </div>
  );
}

/** Shows a small celebration when a badge is earned. */
export function Celebration() {
  const [queue, setQueue] = useState<string[]>([]);
  const reduced = useReducedMotion();
  const catalog = useMemo(() => badgeCatalog(), []);
  const current = catalog.find((b) => b.id === queue[0]);

  useEffect(() => onBadgesEarned((ids) => setQueue((q) => [...q, ...ids])), []);
  useEffect(() => {
    if (!queue.length) return;
    const t = window.setTimeout(() => setQueue((q) => q.slice(1)), 5500);
    return () => window.clearTimeout(t);
  }, [queue]);

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-5 z-[80] flex justify-center px-4" aria-live="polite">
      <AnimatePresence mode="wait">
        {current && (
          <motion.div
            key={current.id}
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: 40, scale: 0.9 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, y: 20, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="pointer-events-auto relative flex w-full max-w-sm items-center gap-4 rounded-3xl border border-line bg-surface p-4 shadow-lift"
            role="status"
          >
            {!reduced && <Confetti />}
            <motion.span
              initial={reduced ? false : { rotate: -20, scale: 0.6 }}
              animate={{ rotate: 0, scale: 1 }}
              transition={{ type: 'spring', stiffness: 260, damping: 12, delay: 0.1 }}
              className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft"
              style={{ backgroundColor: current.color }}
            >
              <current.icon className="h-7 w-7" aria-hidden="true" />
            </motion.span>
            <div className="min-w-0 flex-1">
              <p className="text-2xs font-bold uppercase tracking-wider text-brand-700 dark:text-brand-300">Badge earned</p>
              <p className="text-lg font-extrabold leading-tight">{current.title}</p>
              <p className="text-sm leading-snug text-muted">{current.description}</p>
              <Link to="/progress" className="mt-1 inline-block text-xs font-bold text-link" onClick={() => setQueue((q) => q.slice(1))}>
                See all badges
              </Link>
            </div>
            <button
              type="button"
              onClick={() => setQueue((q) => q.slice(1))}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-lg text-muted hover:bg-surface-2"
              aria-label="Dismiss"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
