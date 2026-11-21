import type { ReactNode } from 'react';
import { cn } from '@/lib/cn';

export function SectionHeading({
  eyebrow,
  title,
  children,
  id,
  className,
  align = 'left',
}: {
  eyebrow?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  id?: string;
  className?: string;
  align?: 'left' | 'center';
}) {
  return (
    <div className={cn('mb-6 sm:mb-8', align === 'center' && 'mx-auto max-w-2xl text-center', className)}>
      {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
      <h2 id={id} className="scroll-mt-28 text-2xl font-extrabold sm:text-3xl lg:text-[2.1rem]">
        {title}
      </h2>
      {children && <div className="mt-3 text-base leading-relaxed text-muted sm:text-lg">{children}</div>}
    </div>
  );
}
