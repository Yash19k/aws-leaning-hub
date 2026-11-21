import { useId, useState, type ReactElement, cloneElement } from 'react';
import { cn } from '@/lib/cn';

/** Hover/focus tooltip. The child must be a focusable element. */
export function Tooltip({
  content,
  children,
  side = 'top',
}: {
  content: string;
  children: ReactElement<Record<string, unknown>>;
  side?: 'top' | 'bottom';
}) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
      onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
    >
      {cloneElement(children, { 'aria-describedby': id })}
      <span
        id={id}
        role="tooltip"
        className={cn(
          'pointer-events-none absolute left-1/2 z-50 w-max max-w-[16rem] -translate-x-1/2 rounded-lg bg-navy-900 px-2.5 py-1.5 text-center text-xs font-semibold text-white shadow-lift transition-all duration-150 dark:bg-navy-100 dark:text-navy-950',
          side === 'top' ? 'bottom-full mb-2' : 'top-full mt-2',
          open ? 'visible opacity-100' : 'invisible translate-y-1 opacity-0',
        )}
      >
        {content}
      </span>
    </span>
  );
}
