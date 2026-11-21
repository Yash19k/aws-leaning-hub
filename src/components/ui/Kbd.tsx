import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        'inline-flex h-6 min-w-6 items-center justify-center rounded-md border border-line border-b-2 bg-surface px-1.5 font-mono text-2xs font-bold text-muted',
        className,
      )}
    >
      {children}
    </kbd>
  );
}
