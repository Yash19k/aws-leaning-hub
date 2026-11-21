import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORIES, DIFFICULTY } from '@/lib/categories';
import { cn } from '@/lib/cn';
import { getService } from '@/lib/content';
import { Icon } from '@/lib/icons';
import type { Difficulty } from '@/lib/types';

type Tone = 'neutral' | 'brand' | 'teal' | 'navy' | 'success' | 'danger';

const tones: Record<Tone, string> = {
  neutral: 'bg-surface-2 text-muted border border-line',
  brand: 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200',
  teal: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
  navy: 'bg-navy-100 text-navy-800 dark:bg-navy-800 dark:text-navy-100',
  success: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  danger: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
};

export function Badge({
  tone = 'neutral',
  icon,
  children,
  className,
}: {
  tone?: Tone;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold leading-none',
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}

export function DifficultyBadge({ level, className }: { level: Difficulty; className?: string }) {
  const d = DIFFICULTY[level];
  return (
    <span
      className={cn('inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-bold', d.className, className)}
    >
      <span className="flex gap-0.5" aria-hidden="true">
        {[1, 2, 3].map((n) => (
          <span key={n} className={cn('h-2.5 w-1 rounded-full bg-current', n > d.rank && 'opacity-25')} />
        ))}
      </span>
      {d.label}
    </span>
  );
}

/** Small coloured chip for an AWS service (colour = category). */
export function ServiceChip({ slug, link = false, className }: { slug: string; link?: boolean; className?: string }) {
  const s = getService(slug);
  if (!s) return null;
  const color = CATEGORIES[s.category].color;
  const content = (
    <>
      <Icon name={s.icon} className="h-3.5 w-3.5" />
      {s.shortName}
    </>
  );
  const cls = cn(
    'inline-flex items-center gap-1.5 rounded-lg border px-2 py-1 text-xs font-bold transition-colors',
    link && 'hover:brightness-110',
    className,
  );
  const style = { color, borderColor: `${color}55`, backgroundColor: `${color}14` };
  if (link) {
    return (
      <Link to={`/services/${s.slug}`} className={cls} style={style}>
        {content}
      </Link>
    );
  }
  return (
    <span className={cls} style={style}>
      {content}
    </span>
  );
}

export function CategoryDot({ category, className }: { category: keyof typeof CATEGORIES; className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn('inline-block h-2.5 w-2.5 rounded-full', className)}
      style={{ backgroundColor: CATEGORIES[category].color }}
    />
  );
}
