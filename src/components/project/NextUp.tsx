import { Link } from 'react-router-dom';
import { ArrowRight, Sparkles } from 'lucide-react';
import { cn } from '@/lib/cn';

export interface NextUpItem {
  to: string;
  title: string;
  description: string;
}

/** "Next up" suggestions so no page is a dead end. */
export function NextUp({ items, className, title = 'Next up' }: { items: NextUpItem[]; className?: string; title?: string }) {
  if (!items.length) return null;
  return (
    <section className={cn('mt-16', className)} aria-labelledby="next-up">
      <h2 id="next-up" className="mb-4 flex items-center gap-2 text-lg font-bold">
        <Sparkles className="h-5 w-5 text-brand-500" aria-hidden="true" /> {title}
      </h2>
      <div className={cn('grid gap-3', items.length > 1 && 'sm:grid-cols-2', items.length > 2 && 'lg:grid-cols-3')}>
        {items.map((it) => (
          <Link
            key={it.to}
            to={it.to}
            className="group flex items-start justify-between gap-4 rounded-2xl border-2 border-line bg-surface p-5 transition-all hover:-translate-y-1 hover:border-brand-400 hover:shadow-lift"
          >
            <span>
              <span className="block font-bold text-ink">{it.title}</span>
              <span className="mt-1 block text-sm leading-snug text-muted">{it.description}</span>
            </span>
            <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
          </Link>
        ))}
      </div>
    </section>
  );
}
