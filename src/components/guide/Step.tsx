import { useEffect, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import { cn } from '@/lib/cn';
import { setStepDone } from '@/lib/progress';
import { useGuide } from './GuideContext';

/** Numbered step card with a "Mark as done" checkbox. */
export function Step({ number, title, children }: { number: number; title: string; children: ReactNode }) {
  const guide = useGuide();
  const done = guide?.isDone(number) ?? false;
  const register = guide?.register;
  const unregister = guide?.unregister;

  useEffect(() => {
    register?.({ number, title });
    return () => unregister?.(number);
  }, [register, unregister, number, title]);

  return (
    <section
      id={`step-${number}`}
      className={cn(
        'not-prose relative my-8 scroll-mt-24 rounded-3xl border-2 bg-surface p-5 transition-colors sm:p-7',
        done ? 'border-teal-400/70 dark:border-teal-700' : 'border-line',
      )}
    >
      <header className="mb-4 flex items-start gap-4">
        <motion.span
          animate={done ? { scale: [1, 1.18, 1] } : { scale: 1 }}
          transition={{ duration: 0.35 }}
          className={cn(
            'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold',
            done ? 'bg-teal-500 text-navy-950' : 'bg-navy-900 text-white dark:bg-navy-100 dark:text-navy-950',
          )}
          aria-hidden="true"
        >
          {done ? <Check className="h-6 w-6" strokeWidth={3} /> : number}
        </motion.span>
        <div className="min-w-0 flex-1 pt-1">
          <p className="text-2xs font-bold uppercase tracking-wider text-muted">Step {number}</p>
          <h3 className="!mt-0.5 !text-xl font-bold leading-snug sm:!text-[1.35rem]">{title}</h3>
        </div>
      </header>
      <div className="prose-hub max-w-none">{children}</div>
      {guide && (
        <label
          className={cn(
            'mt-6 flex cursor-pointer items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-3 font-bold transition-colors',
            done
              ? 'border-teal-400 bg-teal-50 text-teal-800 dark:border-teal-700 dark:bg-teal-900/30 dark:text-teal-200'
              : 'border-line text-muted hover:border-brand-400 hover:text-ink',
          )}
        >
          <input
            type="checkbox"
            className="peer sr-only"
            checked={done}
            onChange={(e) => setStepDone(guide.guideId, String(number), e.target.checked)}
          />
          <span
            className={cn(
              'flex h-6 w-6 items-center justify-center rounded-md border-2 transition-colors peer-focus-visible:ring-4 peer-focus-visible:ring-brand-400/50',
              done ? 'border-teal-500 bg-teal-500 text-navy-950' : 'border-current',
            )}
            aria-hidden="true"
          >
            {done && <Check className="h-4 w-4" strokeWidth={3} />}
          </span>
          {done ? 'Done! Nice work.' : 'Mark as done'}
        </label>
      )}
    </section>
  );
}
