import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { getGuide } from '@/lib/content';
import { Icon } from '@/lib/icons';
import { setupGuideId, useProgress } from '@/lib/progress';

/** "Need X first? Open the X guide" card, ticked when that setup guide is complete. */
export function Prerequisite({ slug }: { slug: string }) {
  const guide = getGuide(slug);
  const done = useProgress((s) => !!s.guidesCompleted[setupGuideId(slug)]);
  if (!guide) return <span className="text-rose-600">Unknown guide: {slug}</span>;

  return (
    <Link
      to={`/setup/${slug}`}
      data-plain
      className={cn(
        'not-prose group my-2 flex items-center gap-3 rounded-2xl border-2 bg-surface p-3 pr-4 no-underline transition-all hover:-translate-y-0.5 hover:shadow-soft',
        done ? 'border-teal-400/70 dark:border-teal-700' : 'border-line hover:border-brand-400',
      )}
    >
      <span
        className={cn(
          'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl',
          done ? 'bg-teal-500 text-navy-950' : 'bg-surface-2 text-ink',
        )}
      >
        {done ? <CheckCircle2 className="h-5 w-5" /> : <Icon name={guide.icon} className="h-5 w-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-2xs font-bold uppercase tracking-wider text-muted">
          {done ? 'Done' : `Need this first? · ${guide.estimatedTime}`}
        </span>
        <span className="block font-bold text-ink">{guide.title}</span>
      </span>
      <ArrowRight className="h-4 w-4 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
    </Link>
  );
}
