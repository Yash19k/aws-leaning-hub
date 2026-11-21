import { useEffect, useMemo, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Award, BookOpen, CreditCard, GraduationCap, Search, ShieldCheck, X, type LucideIcon } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NextUp } from '@/components/project/NextUp';
import { AccordionItem } from '@/components/ui/Accordion';
import { faqItems } from '@/content/faq/faq';
import { Markdown, plain } from '@/lib/markdown';
import { usePageMeta } from '@/lib/meta';
import type { FaqGroup } from '@/lib/types';

const GROUPS: { id: FaqGroup; title: string; icon: LucideIcon }[] = [
  { id: 'account', title: 'Account & billing', icon: CreditCard },
  { id: 'safety', title: 'Safety', icon: ShieldCheck },
  { id: 'learning', title: 'Learning path', icon: BookOpen },
  { id: 'projects', title: 'College projects & hackathons', icon: GraduationCap },
  { id: 'certifications', title: 'Certifications', icon: Award },
];

export default function FaqPage() {
  usePageMeta('FAQ', 'Beginner questions about AWS accounts, billing, safety, learning paths, hackathons and certifications.');
  const [q, setQ] = useState('');
  const { hash } = useLocation();
  const [open, setOpen] = useState<string | null>(hash ? hash.slice(1) : null);
  useEffect(() => {
    if (hash) setOpen(hash.slice(1));
  }, [hash]);

  const filtered = useMemo(() => {
    const words = q.toLowerCase().split(/\s+/).filter(Boolean);
    if (!words.length) return faqItems;
    return faqItems.filter((f) => {
      const hay = `${f.question} ${plain(f.answer)} ${(f.tags ?? []).join(' ')}`.toLowerCase();
      return words.every((w) => hay.includes(w));
    });
  }, [q]);

  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ label: 'FAQ' }]} />
      <header className="mb-8 max-w-2xl">
        <p className="eyebrow mb-2">Questions</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Frequently asked questions</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">The things every AWS beginner wonders about, answered honestly.</p>
      </header>

      <label className="relative mb-10 block max-w-xl">
        <span className="sr-only">Filter questions</span>
        <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted" aria-hidden="true" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Type to filter, e.g. free tier, credit card, certification"
          className="h-14 w-full rounded-2xl border-2 border-line bg-surface pl-12 pr-12 text-base font-semibold shadow-soft outline-none focus:border-brand-400"
        />
        {q && (
          <button type="button" onClick={() => setQ('')} className="absolute right-3 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-lg text-muted hover:bg-surface-2" aria-label="Clear">
            <X className="h-4 w-4" />
          </button>
        )}
      </label>

      {filtered.length === 0 && <p className="py-12 text-center text-muted">No questions match "{q}". Try fewer words.</p>}

      <div className="space-y-10">
        {GROUPS.map((g) => {
          const items = filtered.filter((f) => f.group === g.id);
          if (!items.length) return null;
          return (
            <section key={g.id} aria-labelledby={`faq-${g.id}`}>
              <h2 id={`faq-${g.id}`} className="mb-3 flex items-center gap-2 text-xl font-extrabold">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-100 text-brand-800 dark:bg-brand-900/40 dark:text-brand-200">
                  <g.icon className="h-5 w-5" aria-hidden="true" />
                </span>
                {g.title}
                <span className="text-sm font-semibold text-muted">({items.length})</span>
              </h2>
              <div className="card-base px-5 sm:px-6">
                {items.map((f) => (
                  <AccordionItem
                    key={f.id}
                    id={f.id}
                    title={f.question}
                    open={open === f.id || (!!q && items.length <= 3)}
                    onOpenChange={(o) => setOpen(o ? f.id : null)}
                    className="scroll-mt-28"
                  >
                    <Markdown text={f.answer} />
                  </AccordionItem>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      <NextUp
        items={[
          { to: '/troubleshooting', title: 'Got an error instead?', description: 'Paste it into the troubleshooter.' },
          { to: '/setup', title: 'Set up your account', description: 'Nine short guides, from sign-up to first deploy.' },
          { to: '/projects', title: 'Explore a project', description: 'Click through a real architecture.' },
        ]}
      />
    </div>
  );
}
