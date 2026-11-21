import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowRight, Check, Clock, Rocket } from 'lucide-react';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { NextUp } from '@/components/project/NextUp';
import { ButtonLink } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { cn } from '@/lib/cn';
import { getProject, guides, projects } from '@/lib/content';
import { useReducedMotion } from '@/lib/hooks';
import { Icon } from '@/lib/icons';
import { usePageMeta } from '@/lib/meta';
import { setupGuideId, useProgress } from '@/lib/progress';

export default function SetupIndex() {
  usePageMeta('Set up AWS', 'Create and secure your AWS account, set a billing alarm and install your tools, one short guide at a time.');
  const completed = useProgress((s) => s.guidesCompleted);
  const reduced = useReducedMotion();
  const doneCount = guides.filter((g) => completed[setupGuideId(g.slug)]).length;
  const nextGuide = guides.find((g) => !completed[setupGuideId(g.slug)]);

  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ label: 'Setup' }]} />
      <header className="grid gap-8 lg:grid-cols-[1fr_340px] lg:items-end">
        <div>
          <p className="eyebrow mb-2">Your roadmap</p>
          <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">From zero to your first deploy</h1>
          <p className="mt-4 max-w-2xl text-lg leading-relaxed text-muted">
            {guides.length} short guides, in order. Do the first six once and you are ready for any project here. The last
            three depend on which project you build.
          </p>
        </div>
        <div className="card-base p-5">
          <ProgressBar value={doneCount} max={guides.length} label="Guides done" showValue />
          <ButtonLink
            to={nextGuide ? `/setup/${nextGuide.slug}` : '/projects'}
            className="mt-4 w-full"
            size="lg"
            icon={<Rocket className="h-5 w-5" />}
          >
            {doneCount === 0 ? 'Start setup' : nextGuide ? `Continue: ${nextGuide.title}` : 'All done, pick a project'}
          </ButtonLink>
        </div>
      </header>

      <Callout type="cost" title="Will this cost money?">
        <p>
          Setting up costs nothing. AWS asks for a card when you sign up, and guide 3 sets an alarm so you are emailed if
          spending ever goes above a limit you choose.
        </p>
      </Callout>

      <ol className="relative mx-auto mt-12 max-w-4xl">
        <div className="absolute bottom-6 left-[1.4rem] top-6 w-1 rounded-full bg-line md:left-1/2 md:-translate-x-1/2" aria-hidden="true" />
        <motion.div
          className="absolute left-[1.4rem] top-6 w-1 origin-top rounded-full bg-gradient-to-b from-teal-400 to-brand-500 md:left-1/2 md:-translate-x-1/2"
          style={{ height: `calc((100% - 3rem) * ${doneCount / guides.length})` }}
          aria-hidden="true"
        />
        {guides.map((g, i) => {
          const done = !!completed[setupGuideId(g.slug)];
          const isNext = nextGuide?.slug === g.slug;
          const left = i % 2 === 0;
          return (
            <motion.li
              key={g.slug}
              initial={reduced ? false : { opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.4 }}
              className={cn('relative mb-6 pl-16 md:w-1/2 md:pl-0', left ? 'md:pr-12' : 'md:ml-auto md:pl-12')}
            >
              <span
                className={cn(
                  'absolute left-0 top-5 z-10 flex h-12 w-12 items-center justify-center rounded-2xl border-4 border-bg text-lg font-extrabold shadow-soft md:top-6',
                  left ? 'md:left-auto md:right-0 md:translate-x-1/2' : 'md:-translate-x-1/2',
                  done ? 'bg-teal-500 text-navy-950' : isNext ? 'bg-brand-500 text-navy-950' : 'bg-surface text-muted',
                  isNext && !reduced && 'animate-pulse-ring',
                )}
                aria-hidden="true"
              >
                {done ? <Check className="h-6 w-6" strokeWidth={3} /> : i + 1}
              </span>
              <Link
                to={`/setup/${g.slug}`}
                className={cn(
                  'group block rounded-3xl border-2 bg-surface p-5 shadow-soft transition-all hover:-translate-y-1 hover:shadow-lift',
                  done ? 'border-teal-300 dark:border-teal-800' : isNext ? 'border-brand-400' : 'border-line hover:border-brand-300',
                )}
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-ink">
                    <Icon name={g.icon} className="h-5 w-5" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-muted">
                      <span>Guide {i + 1}</span>
                      <span className="inline-flex items-center gap-1">
                        <Clock className="h-3 w-3" aria-hidden="true" /> {g.estimatedTime}
                      </span>
                      {isNext && <span className="rounded-full bg-brand-500 px-2 py-0.5 text-navy-950">Up next</span>}
                      {done && <span className="rounded-full bg-teal-100 px-2 py-0.5 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200">Done</span>}
                    </div>
                    <h2 className="mt-1 text-lg font-extrabold leading-snug">{g.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted">{g.summary}</p>
                    {g.neededFor?.length ? (
                      <p className="mt-2 text-xs font-semibold text-muted">
                        Needed for: {g.neededFor.map((s) => getProject(s)?.title.split(':')[0] ?? s).join(', ')}
                      </p>
                    ) : null}
                  </div>
                  <ArrowRight className="mt-1 h-5 w-5 shrink-0 text-muted transition-transform group-hover:translate-x-1 group-hover:text-brand-600" aria-hidden="true" />
                </div>
              </Link>
            </motion.li>
          );
        })}
      </ol>

      <NextUp
        title="Then pick a project"
        items={projects.map((p) => ({ to: `/projects/${p.slug}`, title: p.title.split(':')[0], description: p.tagline }))}
      />
    </div>
  );
}
