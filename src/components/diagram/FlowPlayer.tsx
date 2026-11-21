import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle2, ChevronLeft, ChevronRight, Gauge, Pause, Play, RotateCcw, Route, Square } from 'lucide-react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { cn } from '@/lib/cn';
import { inline } from '@/lib/markdown';
import { EMPTY_LIST, useProgress } from '@/lib/progress';
import { useDiagram } from './DiagramContext';

const SPEEDS = [0.5, 1, 1.5, 2];

function payloadText(p: unknown): string {
  if (typeof p === 'string') return p;
  try {
    return JSON.stringify(p, null, 2);
  } catch {
    return String(p);
  }
}

/** Lists the project's request flows and plays them on the diagram. */
export function FlowPlayer({ className }: { className?: string }) {
  const d = useDiagram();
  const completed = useProgress((s) => s.flowsCompleted[d.source.slug] ?? EMPTY_LIST);
  const flow = d.currentFlow;
  const step = d.currentStep;
  const done = d.flow.phase === 'done';
  const total = flow?.steps.length ?? 0;

  const cycleSpeed = () => {
    const i = SPEEDS.indexOf(d.flow.speed);
    d.setSpeed(SPEEDS[(i + 1) % SPEEDS.length]);
  };

  const edge = step?.edgeId ? d.edgesById.get(step.edgeId) : undefined;
  const from = edge ? d.nodesById.get(step?.reverse ? edge.target : edge.source) : undefined;
  const to = edge ? d.nodesById.get(step?.reverse ? edge.source : edge.target) : undefined;
  const at = step?.nodeId ? d.nodesById.get(step.nodeId) : undefined;

  return (
    <div className={cn('card-base flex flex-col p-4 sm:p-5', className)}>
      <div className="mb-3 flex items-center gap-2">
        <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-500 text-navy-950">
          <Route className="h-4 w-4" aria-hidden="true" />
        </span>
        <div>
          <h3 className="font-bold leading-tight">Watch a request travel</h3>
          <p className="text-xs text-muted">Pick a flow and follow the dot.</p>
        </div>
      </div>

      <ul className="space-y-1.5" aria-label="Request flows">
        {d.source.flows.map((f) => {
          const selected = f.id === flow?.id;
          const isDone = completed.includes(f.id);
          return (
            <li key={f.id}>
              <button
                type="button"
                onClick={() => (selected ? d.restart() : d.selectFlow(f.id))}
                aria-pressed={selected}
                className={cn(
                  'flex w-full items-start gap-3 rounded-xl border-2 px-3 py-2.5 text-left transition-all',
                  selected
                    ? 'border-brand-500 bg-brand-50 dark:bg-brand-900/20'
                    : 'border-transparent bg-surface-2/70 hover:border-line hover:bg-surface-2',
                )}
              >
                <span
                  className={cn(
                    'mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full',
                    selected ? 'bg-brand-500 text-navy-950' : 'bg-surface text-muted',
                  )}
                >
                  {selected && d.flow.playing ? <Pause className="h-3 w-3" /> : <Play className="h-3 w-3" />}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="flex items-center gap-1.5 text-sm font-bold text-ink">
                    {f.title}
                    {isDone && <CheckCircle2 className="h-4 w-4 text-teal-600" aria-label="watched" />}
                  </span>
                  <span className="block text-xs leading-snug text-muted">{f.summary}</span>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <AnimatePresence initial={false}>
        {flow && step && (
          <motion.div
            key="player"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 border-t border-line pt-4">
              {/* Controls */}
              <div className="flex items-center gap-1">
                <button type="button" onClick={d.restart} aria-label="Restart" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-surface-2">
                  <RotateCcw className="h-4 w-4" />
                </button>
                <button type="button" onClick={d.prev} disabled={d.flow.stepIndex === 0} aria-label="Previous step" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-surface-2 disabled:opacity-30">
                  <ChevronLeft className="h-5 w-5" />
                </button>
                {d.flow.playing ? (
                  <button type="button" onClick={d.pause} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 font-bold text-navy-950 hover:bg-brand-400">
                    <Pause className="h-4 w-4" /> Pause
                  </button>
                ) : (
                  <button type="button" onClick={d.play} className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-brand-500 font-bold text-navy-950 hover:bg-brand-400">
                    {done ? <RotateCcw className="h-4 w-4" /> : <Play className="h-4 w-4" />} {done ? 'Replay' : 'Play'}
                  </button>
                )}
                <button type="button" onClick={d.next} disabled={done} aria-label="Next step" className="flex h-9 w-9 items-center justify-center rounded-lg text-ink hover:bg-surface-2 disabled:opacity-30">
                  <ChevronRight className="h-5 w-5" />
                </button>
                <button
                  type="button"
                  onClick={cycleSpeed}
                  aria-label={`Speed ${d.flow.speed}x, change speed`}
                  className="flex h-9 items-center gap-1 rounded-lg px-2 text-xs font-bold text-ink hover:bg-surface-2"
                >
                  <Gauge className="h-4 w-4" />
                  {d.flow.speed}x
                </button>
                <button type="button" onClick={d.stopFlow} aria-label="Stop" className="flex h-9 w-9 items-center justify-center rounded-lg text-muted hover:bg-surface-2 hover:text-ink">
                  <Square className="h-3.5 w-3.5" />
                </button>
              </div>

              {/* Step timeline */}
              <ol className="mt-3 flex flex-wrap gap-1.5" aria-label="Steps">
                {flow.steps.map((s, i) => (
                  <li key={i}>
                    <button
                      type="button"
                      onClick={() => d.gotoStep(i)}
                      aria-label={`Step ${i + 1}: ${s.title}`}
                      aria-current={i === d.flow.stepIndex ? 'step' : undefined}
                      className={cn(
                        'flex h-7 w-7 items-center justify-center rounded-full text-xs font-bold transition-all',
                        i === d.flow.stepIndex
                          ? 'scale-110 bg-brand-500 text-navy-950 shadow-glow'
                          : i < d.flow.stepIndex || done
                            ? 'bg-brand-200 text-brand-900 dark:bg-brand-900/60 dark:text-brand-100'
                            : 'bg-surface-2 text-muted hover:text-ink',
                      )}
                    >
                      {i + 1}
                    </button>
                  </li>
                ))}
              </ol>

              {/* Caption */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={`${flow.id}-${d.flow.stepIndex}-${done}`}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18 }}
                  className="mt-3 rounded-2xl bg-surface-2/70 p-4"
                >
                  <p className="text-2xs font-bold uppercase tracking-wider text-muted">
                    Step {d.flow.stepIndex + 1} of {total}
                    {from && to && (
                      <>
                        {' '}
                        · {from.label} <span aria-hidden="true">→</span> {to.label}
                      </>
                    )}
                    {at && <> · inside {at.label}</>}
                  </p>
                  <p className="mt-1 text-[1.02rem] font-bold leading-snug">{done ? 'That is the whole journey' : step.title}</p>
                  <p className="mt-1 text-sm leading-relaxed text-ink/85">
                    {done ? 'Replay it, slow it down, or click any step number to jump back.' : inline(step.explanation)}
                  </p>
                  {!done && step.payloadExample !== undefined && (
                    <div className="mt-3">
                      <p className="mb-1 text-2xs font-bold uppercase tracking-wider text-muted">What travels</p>
                      <CodeBlock code={payloadText(step.payloadExample)} language="json" bare className="my-0" showLineNumbers={false} maxHeight={220} />
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              {d.reducedMotion && (
                <p className="mt-2 text-xs text-muted">
                  Animations are off because your device prefers reduced motion. Use the arrows to step through.
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
