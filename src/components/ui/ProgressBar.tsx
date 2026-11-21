import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

export function ProgressBar({
  value,
  max = 100,
  label,
  showValue,
  className,
  tone = 'brand',
  size = 'md',
}: {
  value: number;
  max?: number;
  label: string;
  showValue?: boolean;
  className?: string;
  tone?: 'brand' | 'teal';
  size?: 'sm' | 'md';
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div className={className}>
      {showValue && (
        <div className="mb-1.5 flex items-center justify-between text-xs font-bold">
          <span className="text-muted">{label}</span>
          <span className="text-ink">
            {value}/{max}
          </span>
        </div>
      )}
      <div
        role="progressbar"
        aria-label={label}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-valuenow={value}
        className={cn('overflow-hidden rounded-full bg-surface-2', size === 'sm' ? 'h-1.5' : 'h-2.5')}
      >
        <motion.div
          className={cn(
            'h-full rounded-full',
            tone === 'brand' ? 'bg-gradient-to-r from-brand-400 to-brand-500' : 'bg-gradient-to-r from-teal-400 to-teal-500',
          )}
          initial={false}
          animate={{ width: `${pct}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 20 }}
        />
      </div>
    </div>
  );
}
