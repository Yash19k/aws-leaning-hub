import type { HTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/cn';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  interactive?: boolean;
  padded?: boolean;
  children: ReactNode;
}

export function Card({ interactive, padded = true, className, children, ...rest }: CardProps) {
  return (
    <div
      className={cn(
        'card-base',
        padded && 'p-5 sm:p-6',
        interactive &&
          'transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift dark:hover:border-brand-700',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardTitle({ children, className }: { children: ReactNode; className?: string }) {
  return <h3 className={cn('text-lg font-bold leading-snug', className)}>{children}</h3>;
}
