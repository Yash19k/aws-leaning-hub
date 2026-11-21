import { useMemo } from 'react';
import { motion } from 'framer-motion';
import { Lock, Trophy } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ProgressSummary } from '@/components/layout/ProgressMenu';
import { NextUp } from '@/components/project/NextUp';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { badgeCatalog } from '@/lib/badges';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks';
import { usePageMeta } from '@/lib/meta';
import { getProgress, useProgress } from '@/lib/progress';

export default function ProgressPage() {
  usePageMeta('Your progress', 'Badges and progress saved in this browser.');
  const catalog = useMemo(() => badgeCatalog(), []);
  const reduced = useReducedMotion();
  const earned = useProgress((s) => s.badges);
  // Re-render on any progress change so the bars stay current.
  useProgress((s) => s);
  const state = getProgress();

  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ label: 'Your progress' }]} />
      <header className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="eyebrow mb-2">Saved in this browser</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Your badges</h1>
          <p className="mt-3 text-lg text-muted">
            {Object.keys(earned).length} of {catalog.length} earned. Nothing leaves your device.
          </p>
        </div>
        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-500 text-navy-950 shadow-glow">
          <Trophy className="h-8 w-8" aria-hidden="true" />
        </span>
      </header>

      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {catalog.map((b, i) => {
          const has = !!earned[b.id];
          const { value, max } = b.progress(state);
          return (
            <motion.li
              key={b.id}
              initial={reduced ? false : { opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className={cn('relative overflow-hidden rounded-3xl border-2 p-5', has ? 'border-transparent bg-surface shadow-lift' : 'border-dashed border-line bg-surface/50')}
            >
              {has && <div className="absolute inset-x-0 top-0 h-1.5" style={{ backgroundColor: b.color }} aria-hidden="true" />}
              <div className="flex items-start gap-4">
                <span
                  className={cn('flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl', has ? 'text-white shadow-soft' : 'bg-surface-2 text-muted')}
                  style={has ? { backgroundColor: b.color } : undefined}
                >
                  {has ? <b.icon className="h-7 w-7" aria-hidden="true" /> : <Lock className="h-6 w-6" aria-hidden="true" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn('text-lg font-extrabold leading-tight', !has && 'text-ink/70')}>{b.title}</p>
                  <p className="mt-1 text-sm leading-snug text-muted">{b.description}</p>
                  {has ? (
                    <p className="mt-2 text-xs font-bold text-teal-700 dark:text-teal-300">
                      Earned {new Date(earned[b.id]).toLocaleDateString()}
                    </p>
                  ) : (
                    max > 1 && <ProgressBar value={value} max={max} label={`${b.title} progress`} showValue className="mt-3" size="sm" />
                  )}
                </div>
              </div>
            </motion.li>
          );
        })}
      </ul>

      <section className="mt-14 max-w-lg">
        <h2 className="mb-4 text-xl font-extrabold">Guides and projects</h2>
        <div className="card-base p-5">
          <ProgressSummary />
        </div>
      </section>

      <NextUp
        items={[
          { to: '/setup', title: 'Continue setup', description: 'Tick off the next guide.' },
          { to: '/projects', title: 'Explore a diagram', description: 'Open every box to earn Explorer.' },
          { to: '/services', title: 'Take a service quiz', description: 'Five right answers earns Quiz Whiz.' },
        ]}
      />
    </div>
  );
}
