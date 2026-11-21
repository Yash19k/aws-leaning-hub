import { useId, useRef, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';
import { useReducedMotion } from '@/lib/hooks';

export interface TabItem {
  id: string;
  label: ReactNode;
  content: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  value: string;
  onChange: (id: string) => void;
  label: string;
  className?: string;
  size?: 'sm' | 'md';
}

/** Accessible tabs (arrow keys move between tabs). Controlled. */
export function Tabs({ items, value, onChange, label, className, size = 'md' }: TabsProps) {
  const uid = useId();
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const reduced = useReducedMotion();
  const active = items.find((t) => t.id === value) ?? items[0];

  const onKey = (e: React.KeyboardEvent, i: number) => {
    let next = -1;
    if (e.key === 'ArrowRight') next = (i + 1) % items.length;
    if (e.key === 'ArrowLeft') next = (i - 1 + items.length) % items.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = items.length - 1;
    if (next >= 0) {
      e.preventDefault();
      onChange(items[next].id);
      refs.current[next]?.focus();
    }
  };

  return (
    <div className={className}>
      <div role="tablist" aria-label={label} className="no-scrollbar flex gap-1 overflow-x-auto rounded-xl bg-surface-2 p-1">
        {items.map((t, i) => {
          const selected = t.id === active.id;
          return (
            <button
              key={t.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              role="tab"
              type="button"
              id={`${uid}-tab-${t.id}`}
              aria-selected={selected}
              aria-controls={`${uid}-panel-${t.id}`}
              tabIndex={selected ? 0 : -1}
              onClick={() => onChange(t.id)}
              onKeyDown={(e) => onKey(e, i)}
              className={cn(
                'relative flex shrink-0 items-center gap-1.5 rounded-lg font-bold transition-colors',
                size === 'sm' ? 'px-3 py-1.5 text-xs' : 'px-4 py-2 text-sm',
                selected ? 'text-ink' : 'text-muted hover:text-ink',
              )}
            >
              {selected && (
                <motion.span
                  layoutId={reduced ? undefined : `${uid}-pill`}
                  className="absolute inset-0 rounded-lg bg-surface shadow-soft"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.4 }}
                />
              )}
              <span className="relative flex items-center gap-1.5">{t.label}</span>
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`${uid}-panel-${active.id}`}
        aria-labelledby={`${uid}-tab-${active.id}`}
        className="mt-3"
      >
        {active.content}
      </div>
    </div>
  );
}
