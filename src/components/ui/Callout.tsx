import type { ReactNode } from 'react';
import { Coins, Info, Lightbulb, ShieldAlert, TriangleAlert } from 'lucide-react';
import { cn } from '@/lib/cn';

export type CalloutType = 'info' | 'tip' | 'warning' | 'cost' | 'security';

const styles: Record<CalloutType, { label: string; icon: typeof Info; box: string; iconBox: string }> = {
  info: {
    label: 'Good to know',
    icon: Info,
    box: 'border-navy-200 bg-navy-50 dark:border-navy-700 dark:bg-navy-900/60',
    iconBox: 'bg-navy-600 text-white dark:bg-navy-300 dark:text-navy-950',
  },
  tip: {
    label: 'Tip',
    icon: Lightbulb,
    box: 'border-teal-200 bg-teal-50 dark:border-teal-800 dark:bg-teal-900/30',
    iconBox: 'bg-teal-500 text-navy-950',
  },
  warning: {
    label: 'Watch out',
    icon: TriangleAlert,
    box: 'border-amber-300 bg-amber-50 dark:border-amber-700/70 dark:bg-amber-900/25',
    iconBox: 'bg-amber-400 text-navy-950',
  },
  cost: {
    label: 'Cost check',
    icon: Coins,
    box: 'border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-900/25',
    iconBox: 'bg-brand-500 text-navy-950',
  },
  security: {
    label: 'Security',
    icon: ShieldAlert,
    box: 'border-rose-300 bg-rose-50 dark:border-rose-800 dark:bg-rose-900/25',
    iconBox: 'bg-rose-600 text-white',
  },
};

export function Callout({
  type = 'info',
  title,
  children,
  className,
}: {
  type?: CalloutType;
  title?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  const s = styles[type] ?? styles.info;
  const IconC = s.icon;
  return (
    <aside className={cn('not-prose my-6 flex gap-3 rounded-2xl border p-4 sm:p-5', s.box, className)} role="note">
      <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', s.iconBox)}>
        <IconC className="h-[18px] w-[18px]" aria-hidden="true" />
      </span>
      <div className="min-w-0 flex-1 text-[0.97rem] leading-relaxed">
        <p className="mb-1 font-bold text-ink">{title ?? s.label}</p>
        <div className="space-y-2 text-ink/85 [&_a]:text-link [&_code]:rounded [&_code]:bg-surface/70 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.875em] [&_ol]:list-decimal [&_ol]:pl-5 [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </div>
    </aside>
  );
}
