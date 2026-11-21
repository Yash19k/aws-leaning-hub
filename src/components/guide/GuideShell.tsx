import { Suspense, useState, type ComponentType, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Check, ListChecks, PartyPopper } from 'lucide-react';
import type { MDXProps } from 'mdx/types';
import { Breadcrumbs, type Crumb } from '@/components/layout/Breadcrumbs';
import { PageLoader } from '@/components/layout/Layout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import { GuideProvider, useGuide } from './GuideContext';
import { MdxScope } from './MdxScope';

function Toc({ onPick }: { onPick?: () => void }) {
  const g = useGuide();
  if (!g || !g.total) return null;
  return (
    <ol className="space-y-0.5">
      {g.steps.map((s) => {
        const done = g.isDone(s.number);
        return (
          <li key={s.number}>
            <a
              href={`#step-${s.number}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(`step-${s.number}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', `#step-${s.number}`);
                onPick?.();
              }}
              className="group flex items-start gap-2.5 rounded-xl px-2 py-1.5 text-sm hover:bg-surface-2"
            >
              <span
                className={cn(
                  'mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md text-2xs font-extrabold',
                  done ? 'bg-teal-500 text-navy-950' : 'bg-surface-2 text-muted group-hover:text-ink',
                )}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} aria-label="done" /> : s.number}
              </span>
              <span className={cn('leading-snug', done ? 'text-muted' : 'text-ink')}>{s.title}</span>
            </a>
          </li>
        );
      })}
    </ol>
  );
}

function StickyProgress() {
  const g = useGuide();
  const [open, setOpen] = useState(false);
  if (!g || !g.total) return null;
  return (
    <div className="sticky top-16 z-30 -mx-4 border-b border-line bg-bg/90 px-4 py-2.5 backdrop-blur-lg lg:hidden">
      <button type="button" onClick={() => setOpen(!open)} className="flex w-full items-center gap-3" aria-expanded={open}>
        <ListChecks className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
        <ProgressBar value={g.doneCount} max={g.total} label="Guide progress" className="flex-1" size="sm" />
        <span className="shrink-0 text-xs font-bold text-ink">
          {g.doneCount}/{g.total}
        </span>
      </button>
      <AnimatePresence>
        {open && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="max-h-[60vh] overflow-y-auto pt-3">
              <Toc onPick={() => setOpen(false)} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function SideProgress() {
  const g = useGuide();
  if (!g || !g.total) return null;
  return (
    <div className="card-base p-4">
      <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Your progress</p>
      <ProgressBar value={g.doneCount} max={g.total} label="Steps done" showValue />
      <div className="mt-4 max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
        <Toc />
      </div>
    </div>
  );
}

function CompletionCard({ children }: { children?: ReactNode }) {
  const g = useGuide();
  const complete = !!g && g.total > 0 && g.doneCount === g.total;
  return (
    <AnimatePresence>
      {complete && (
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          className="mt-10 rounded-3xl border-2 border-teal-400 bg-gradient-to-br from-teal-50 to-surface p-6 text-center dark:border-teal-700 dark:from-teal-900/30 sm:p-8"
        >
          <PartyPopper className="mx-auto h-10 w-10 text-teal-600" aria-hidden="true" />
          <p className="mt-3 text-2xl font-extrabold">Guide complete!</p>
          <p className="mt-1 text-muted">Every step is ticked. It is saved in this browser.</p>
          {children && <div className="mt-5">{children}</div>}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function GuideShell({
  guideId,
  crumbs,
  eyebrow,
  title,
  intro,
  meta,
  Content,
  completion,
  after,
}: {
  guideId: string;
  crumbs: Crumb[];
  eyebrow: ReactNode;
  title: string;
  intro?: ReactNode;
  meta?: ReactNode;
  Content: ComponentType<MDXProps> | undefined;
  completion?: ReactNode;
  after?: ReactNode;
}) {
  return (
    <GuideProvider guideId={guideId}>
      <div className="container-page pt-8">
        <Breadcrumbs items={crumbs} />
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_280px]">
          <div className="min-w-0">
            <header className="mb-8">
              <div className="eyebrow mb-2">{eyebrow}</div>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">{title}</h1>
              {intro && <div className="mt-4 max-w-prose text-lg leading-relaxed text-muted">{intro}</div>}
              {meta && <div className="mt-5 flex flex-wrap gap-2">{meta}</div>}
            </header>
            <StickyProgress />
            <article className="prose-hub max-w-none">
              {Content ? (
                <Suspense fallback={<PageLoader />}>
                  <MdxScope>
                    <Content />
                  </MdxScope>
                </Suspense>
              ) : (
                <p className="text-muted">This guide is being written. Check back soon.</p>
              )}
            </article>
            <CompletionCard>{completion}</CompletionCard>
            {after}
          </div>
          <aside className="hidden lg:block">
            <div className="sticky top-24">
              <SideProgress />
            </div>
          </aside>
        </div>
      </div>
    </GuideProvider>
  );
}
