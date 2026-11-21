import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Pause, Play, RotateCcw, X } from 'lucide-react';
import { cn } from '@/lib/cn';
import { inline } from '@/lib/markdown';
import { useDiagram } from './DiagramContext';

/** Caption + mini controls shown under the diagram while a flow plays (phones and tablets). */
export function NowPlaying({ className }: { className?: string }) {
  const d = useDiagram();
  const flow = d.currentFlow;
  const step = d.currentStep;
  const total = flow?.steps.length ?? 0;
  const done = d.flow.phase === 'done';

  return (
    <AnimatePresence>
      {flow && step && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          className={cn(
            'rounded-2xl border border-brand-300 bg-surface/95 p-3 shadow-lift backdrop-blur dark:border-brand-800',
            className,
          )}
          role="status"
          aria-live="polite"
        >
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-7 min-w-7 shrink-0 items-center justify-center rounded-lg bg-brand-500 px-1.5 text-xs font-extrabold text-navy-950">
              {d.flow.stepIndex + 1}/{total}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-2xs font-bold uppercase tracking-wider text-muted">{flow.title}</p>
              <p className="font-bold leading-snug text-ink">{done ? 'Flow complete' : step.title}</p>
              <p className="mt-0.5 line-clamp-3 text-sm leading-snug text-ink/80">
                {done ? 'Replay it, or pick another flow to watch.' : inline(step.explanation)}
              </p>
            </div>
            <button
              type="button"
              onClick={d.stopFlow}
              className="-mr-1 -mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink"
              aria-label="Stop the flow"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex items-center gap-2">
            <div className="flex flex-1 gap-1" aria-hidden="true">
              {flow.steps.map((_, i) => (
                <span
                  key={i}
                  className={cn(
                    'h-1.5 flex-1 rounded-full transition-colors',
                    i < d.flow.stepIndex || done ? 'bg-brand-400' : i === d.flow.stepIndex ? 'bg-brand-500' : 'bg-surface-2',
                  )}
                />
              ))}
            </div>
            <div className="flex items-center gap-0.5">
              <button type="button" onClick={d.prev} disabled={d.flow.stepIndex === 0} aria-label="Previous step" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink hover:bg-surface-2 disabled:opacity-30">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {done ? (
                <button type="button" onClick={d.restart} aria-label="Replay" className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-navy-950 hover:bg-brand-400">
                  <RotateCcw className="h-4 w-4" />
                </button>
              ) : d.flow.playing ? (
                <button type="button" onClick={d.pause} aria-label="Pause" className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-navy-950 hover:bg-brand-400">
                  <Pause className="h-4 w-4" />
                </button>
              ) : (
                <button type="button" onClick={d.play} aria-label="Play" className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-navy-950 hover:bg-brand-400">
                  <Play className="h-4 w-4" />
                </button>
              )}
              <button type="button" onClick={d.next} disabled={done} aria-label="Next step" className="flex h-8 w-8 items-center justify-center rounded-lg text-ink hover:bg-surface-2 disabled:opacity-30">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
