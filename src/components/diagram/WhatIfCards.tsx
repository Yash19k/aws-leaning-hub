import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleHelp, Crosshair, Plus } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Markdown } from '@/lib/markdown';
import { useReducedMotion } from '@/lib/hooks';
import type { WhatIf } from '@/lib/types';
import { useDiagram } from './DiagramContext';

/** Question cards; opening one highlights the related boxes on the diagram. */
export function WhatIfCards({ items }: { items: WhatIf[] }) {
  const d = useDiagram();
  const [openId, setOpenId] = useState<string | null>(null);
  const reduced = useReducedMotion();

  const toggle = (w: WhatIf) => {
    if (openId === w.id) {
      setOpenId(null);
      d.clearHighlight();
    } else {
      setOpenId(w.id);
      d.setHighlight(w.relatedNodeIds, w.question);
    }
  };

  const showOnDiagram = () => {
    document.getElementById('architecture')?.scrollIntoView({ behavior: reduced ? 'auto' : 'smooth', block: 'start' });
  };

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {items.map((w, i) => {
        const open = openId === w.id;
        return (
          <motion.div
            key={w.id}
            layout={!reduced}
            className={cn(
              'card-base overflow-hidden transition-colors',
              open ? 'border-teal-400 sm:col-span-2 dark:border-teal-600' : 'hover:border-brand-300',
            )}
          >
            <button
              type="button"
              onClick={() => toggle(w)}
              aria-expanded={open}
              className="flex w-full items-start gap-4 p-5 text-left"
            >
              <span
                className={cn(
                  'flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-lg font-extrabold transition-colors',
                  open ? 'bg-teal-500 text-navy-950' : 'bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200',
                )}
                aria-hidden="true"
              >
                {open ? <CircleHelp className="h-5 w-5" /> : `${i + 1}`}
              </span>
              <span className="flex-1">
                <span className="block text-2xs font-bold uppercase tracking-wider text-muted">What if...</span>
                <span className="mt-0.5 block text-[1.05rem] font-bold leading-snug text-ink">{w.question}</span>
              </span>
              <Plus className={cn('mt-1 h-5 w-5 shrink-0 text-muted transition-transform', open && 'rotate-45')} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={reduced ? false : { opacity: 0, rotateX: -12, height: 0 }}
                  animate={{ opacity: 1, rotateX: 0, height: 'auto' }}
                  exit={reduced ? undefined : { opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{ transformOrigin: 'top' }}
                >
                  <div className="border-t border-line px-5 pb-5 pt-4">
                    <Markdown text={w.answer} />
                    {w.relatedNodeIds.length > 0 && (
                      <div className="mt-4 flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-muted">Highlighted:</span>
                        {w.relatedNodeIds.map((id) => (
                          <span key={id} className="rounded-lg bg-teal-100 px-2 py-1 text-xs font-bold text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
                            {d.nodesById.get(id)?.label ?? id}
                          </span>
                        ))}
                        <button
                          type="button"
                          onClick={showOnDiagram}
                          className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-line px-3 py-1.5 text-xs font-bold text-ink hover:border-teal-400"
                        >
                          <Crosshair className="h-3.5 w-3.5" aria-hidden="true" /> Show me on the diagram
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
