import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowRight, Search, X } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NextUp } from '@/components/project/NextUp';
import { CATEGORIES, CATEGORY_ORDER } from '@/lib/categories';
import { cn } from '@/lib/cn';
import { getProject, services } from '@/lib/content';
import { useReducedMotion } from '@/lib/hooks';
import { Icon } from '@/lib/icons';
import { usePageMeta } from '@/lib/meta';
import type { ServiceCategory } from '@/lib/types';

export default function ServicesIndex() {
  usePageMeta('Service library', 'Every AWS service used in the projects, explained with an analogy, key ideas, Free Tier notes and a quiz.');
  const [cat, setCat] = useState<ServiceCategory | 'all'>('all');
  const [q, setQ] = useState('');
  const reduced = useReducedMotion();
  const cats = CATEGORY_ORDER.filter((c) => services.some((s) => s.category === c));

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return services.filter(
      (s) =>
        (cat === 'all' || s.category === cat) &&
        (!needle || [s.name, s.shortName, s.oneLiner, s.analogy].join(' ').toLowerCase().includes(needle)),
    );
  }, [cat, q]);

  const groups = cats.map((c) => ({ c, items: filtered.filter((s) => s.category === c) })).filter((g) => g.items.length);

  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ label: 'Services' }]} />
      <header className="mb-8">
        <p className="eyebrow mb-2">Service library</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">The AWS services in these projects</h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
          Each card is one service: what it is in one line, a real-life analogy, and the projects that use it.
        </p>
      </header>

      <div className="sticky top-16 z-30 -mx-4 mb-8 flex flex-col gap-3 border-b border-line bg-bg/90 px-4 py-3 backdrop-blur-lg sm:mx-0 sm:flex-row sm:items-center sm:rounded-2xl sm:border">
        <label className="relative flex-1 sm:max-w-xs">
          <span className="sr-only">Search services</span>
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" aria-hidden="true" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search services..."
            className="h-10 w-full rounded-xl border border-line bg-surface pl-9 pr-9 text-sm font-semibold outline-none focus:border-brand-400"
          />
          {q && (
            <button type="button" onClick={() => setQ('')} className="absolute right-2 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface-2" aria-label="Clear search">
              <X className="h-4 w-4" />
            </button>
          )}
        </label>
        <div className="no-scrollbar flex gap-1.5 overflow-x-auto" role="group" aria-label="Filter by category">
          {(['all', ...cats] as const).map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setCat(c)}
              aria-pressed={cat === c}
              className={cn(
                'flex shrink-0 items-center gap-1.5 rounded-xl border px-3 py-1.5 text-sm font-bold transition-colors',
                cat === c ? 'border-navy-900 bg-navy-900 text-white dark:border-navy-100 dark:bg-navy-100 dark:text-navy-950' : 'border-line bg-surface text-muted hover:text-ink',
              )}
            >
              {c !== 'all' && <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORIES[c].color }} aria-hidden="true" />}
              {c === 'all' ? 'All' : CATEGORIES[c].label}
            </button>
          ))}
        </div>
      </div>

      {groups.length === 0 && <p className="py-16 text-center text-muted">No services match "{q}".</p>}

      <div className="space-y-12">
        <AnimatePresence initial={false}>
          {groups.map(({ c, items }) => (
            <motion.section key={c} layout={!reduced} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <h2 className="mb-4 flex items-center gap-2 text-xl font-extrabold">
                <span className="h-3 w-3 rounded-full" style={{ backgroundColor: CATEGORIES[c].color }} aria-hidden="true" />
                {CATEGORIES[c].label}
                <span className="text-sm font-semibold text-muted">· {CATEGORIES[c].blurb}</span>
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((s) => {
                  const color = CATEGORIES[s.category].color;
                  return (
                    <Link
                      key={s.slug}
                      to={`/services/${s.slug}`}
                      className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-line bg-surface p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift"
                    >
                      <span className="absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 transition-transform group-hover:scale-125" style={{ backgroundColor: color }} aria-hidden="true" />
                      <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl text-white shadow-soft" style={{ backgroundColor: color }}>
                        <Icon name={s.icon} className="h-6 w-6" />
                      </span>
                      <h3 className="relative mt-4 text-lg font-extrabold">{s.shortName}</h3>
                      <p className="text-xs font-semibold text-muted">{s.name}</p>
                      <p className="mt-2 flex-1 text-[0.95rem] leading-snug text-ink/85">{s.oneLiner}</p>
                      <p className="mt-3 text-sm italic leading-snug text-muted">"{s.analogy}"</p>
                      <div className="mt-4 flex items-center justify-between">
                        <span className="text-xs font-bold text-muted">
                          {s.usedInProjects.length
                            ? `Used in ${s.usedInProjects.map((p) => getProject(p)?.title.split(':')[0]).join(', ')}`
                            : 'Used by this site'}
                        </span>
                        <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" style={{ color }} aria-hidden="true" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </motion.section>
          ))}
        </AnimatePresence>
      </div>

      <NextUp
        items={[
          { to: '/projects', title: 'See them working together', description: 'Explore a project diagram and watch requests flow.' },
          { to: '/setup', title: 'Set up your own account', description: 'Nine short guides, from sign-up to first deploy.' },
          { to: '/progress', title: 'Collect badges', description: 'Each service page ends with a quick quiz.' },
        ]}
      />
    </div>
  );
}
