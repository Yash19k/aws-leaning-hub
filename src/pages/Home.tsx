import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowDown, ArrowRight, Cloud, Compass, Hammer, Lightbulb, MousePointerClick, Rocket, Route } from 'lucide-react';
import { HeroArchitecture } from '@/components/home/HeroArchitecture';
import { ComingSoonCard, ProjectCard } from '@/components/project/ProjectCard';
import { ServiceChip } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DIFFICULTY } from '@/lib/categories';
import { comingSoon, guides, projects, services } from '@/lib/content';
import { useReducedMotion } from '@/lib/hooks';
import { usePageMeta } from '@/lib/meta';
import { setupGuideId, useProgress } from '@/lib/progress';
import { SITE } from '@/lib/site';

const STEPS = [
  {
    icon: MousePointerClick,
    title: 'Explore',
    text: 'Open a project and click any box in its architecture. Watch a request travel through it, step by step.',
    color: 'bg-teal-500',
  },
  {
    icon: Lightbulb,
    title: 'Understand',
    text: 'Every service gets a plain-English job description, an analogy, the real code, and "why not something else?"',
    color: 'bg-brand-500',
  },
  {
    icon: Hammer,
    title: 'Build it',
    text: 'Follow the guide to deploy the same project to your own AWS account, then tear it down so it costs nothing.',
    color: 'bg-navy-700 dark:bg-navy-300',
  },
];

export default function Home() {
  const reduced = useReducedMotion();
  usePageMeta(undefined);
  const ordered = [...projects].sort((a, b) => DIFFICULTY[a.difficulty].rank - DIFFICULTY[b.difficulty].rank || a.order - b.order);
  const setupDone = useProgress((s) => guides.filter((g) => s.guidesCompleted[setupGuideId(g.slug)]).length);
  const fadeUp = (delay = 0) =>
    reduced ? {} : { initial: { opacity: 0, y: 18 }, animate: { opacity: 1, y: 0 }, transition: { delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } };

  return (
    <>
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden">
        <div className="dot-grid absolute inset-0 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" aria-hidden="true" />
        <div className="absolute -left-40 -top-40 h-96 w-96 rounded-full bg-brand-400/20 blur-3xl" aria-hidden="true" />
        <div className="absolute -right-32 top-24 h-80 w-80 rounded-full bg-teal-400/20 blur-3xl" aria-hidden="true" />
        <div className="container-page relative grid items-center gap-10 pb-16 pt-10 sm:pt-16 lg:grid-cols-[1.05fr_1fr] lg:pb-24">
          <div>
            <motion.p {...fadeUp(0)} className="mb-4 inline-flex items-center gap-2 rounded-full border border-line bg-surface px-3 py-1.5 text-xs font-bold text-muted shadow-soft">
              <span className="h-2 w-2 animate-pulse rounded-full bg-teal-500" aria-hidden="true" />
              {SITE.clubName}
            </motion.p>
            <motion.h1 {...fadeUp(0.05)} className="text-display font-extrabold">
              See how real apps are built on{' '}
              <span className="relative whitespace-nowrap text-brand-600 dark:text-brand-400">
                AWS
                <svg className="absolute -bottom-2 left-0 w-full" viewBox="0 0 120 12" aria-hidden="true" preserveAspectRatio="none">
                  <path d="M2 9 C 30 2, 90 2, 118 8" stroke="#14B09F" strokeWidth="4" fill="none" strokeLinecap="round" />
                </svg>
              </span>
              .<br />
              <span className="text-ink/90">Click anything.</span>
            </motion.h1>
            <motion.p {...fadeUp(0.12)} className="mt-6 max-w-xl text-lg leading-relaxed text-muted sm:text-xl">
              Two real serverless projects, taken apart box by box. Tap a service to see its job, watch requests fly
              between them, then build the whole thing in your own account.
            </motion.p>
            <motion.div {...fadeUp(0.18)} className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/#projects" size="lg" iconRight={<ArrowDown className="h-5 w-5" />}>
                Pick a project
              </ButtonLink>
              <ButtonLink to="/setup" size="lg" variant="outline" icon={<Rocket className="h-5 w-5" />}>
                New to AWS? Start here
              </ButtonLink>
            </motion.div>
            <motion.dl {...fadeUp(0.24)} className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                [projects.length, 'real projects'],
                [services.length, 'AWS services'],
                [guides.length, 'setup guides'],
              ].map(([n, l]) => (
                <div key={l as string}>
                  <dt className="sr-only">{l}</dt>
                  <dd className="text-3xl font-extrabold text-ink">{n}</dd>
                  <dd className="text-sm font-semibold text-muted">{l}</dd>
                </div>
              ))}
            </motion.dl>
          </div>
          <motion.div
            initial={reduced ? false : { opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1, duration: 0.6 }}
            className="relative"
          >
            <div className="rounded-[2rem] border border-line bg-surface/70 p-4 shadow-lift backdrop-blur sm:p-6">
              <div className="mb-3 flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-muted">A typical serverless app</span>
                <span className="flex items-center gap-1.5 text-xs font-bold text-teal-700 dark:text-teal-300">
                  <Route className="h-3.5 w-3.5" aria-hidden="true" /> live requests
                </span>
              </div>
              <HeroArchitecture className="w-full text-navy-900 dark:text-navy-100" />
            </div>
            <div className="absolute -bottom-4 -left-3 hidden animate-float rounded-2xl border border-line bg-surface px-4 py-3 shadow-lift sm:block">
              <p className="text-2xs font-bold uppercase tracking-wider text-muted">Every box is clickable</p>
              <p className="flex items-center gap-1.5 text-sm font-bold">
                <MousePointerClick className="h-4 w-4 text-brand-600" aria-hidden="true" /> in the real diagrams
              </p>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ------------------------------------------------------------ gallery */}
      <section id="projects" className="container-page scroll-mt-20 py-12 sm:py-16">
        <SectionHeading eyebrow="Pick a project" title="Start with one. Finish with real AWS skills.">
          Each project is a working app. Beginner first: you'll reuse what you learn in the next one.
        </SectionHeading>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {ordered.map((p, i) => (
            <ProjectCard key={p.slug} project={p} index={i} ribbon={i === 0 ? 'Start here' : undefined} />
          ))}
          {comingSoon.map((c) => (
            <ComingSoonCard key={c.slug} project={c} />
          ))}
        </div>
      </section>

      {/* ------------------------------------------------------------ how it works */}
      <section className="container-page py-12 sm:py-16">
        <SectionHeading eyebrow="How this site works" title="Curiosity first. Theory second." align="center" />
        <ol className="relative grid gap-5 md:grid-cols-3">
          <div className="absolute left-[16%] right-[16%] top-9 hidden h-1 rounded-full bg-gradient-to-r from-teal-400 via-brand-400 to-navy-400 md:block" aria-hidden="true" />
          {STEPS.map((s, i) => (
            <motion.li
              key={s.title}
              initial={reduced ? false : { opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-60px' }}
              transition={{ delay: i * 0.1 }}
              className="relative rounded-3xl border border-line bg-surface p-6 text-center shadow-soft"
            >
              <span className={`relative mx-auto flex h-14 w-14 items-center justify-center rounded-2xl text-white shadow-soft ${s.color}`}>
                <s.icon className="h-7 w-7" aria-hidden="true" />
              </span>
              <p className="mt-4 text-xs font-bold uppercase tracking-wider text-muted">Step {i + 1}</p>
              <h3 className="text-xl font-extrabold">{s.title}</h3>
              <p className="mt-2 leading-relaxed text-muted">{s.text}</p>
            </motion.li>
          ))}
        </ol>
      </section>

      {/* ------------------------------------------------------------ setup + this site */}
      <section className="container-page grid gap-6 py-12 lg:grid-cols-2">
        <Link
          to="/setup"
          className="group relative overflow-hidden rounded-3xl bg-navy-900 p-7 text-white shadow-lift transition-transform hover:-translate-y-1 sm:p-9"
        >
          <div className="absolute -right-10 -top-10 h-48 w-48 rounded-full bg-brand-500/30 blur-2xl" aria-hidden="true" />
          <Compass className="h-10 w-10 text-brand-400" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">New to AWS? Get set up in about an hour.</h2>
          <p className="mt-2 max-w-md text-white/75">
            Account, security, a billing alarm and your tools, one small guide at a time. Your progress is saved in this browser.
          </p>
          <ProgressBar value={setupDone} max={guides.length} label="Setup guides done" className="mt-6 max-w-sm" />
          <p className="mt-2 text-sm font-semibold text-white/70">
            {setupDone}/{guides.length} guides done
          </p>
          <span className="mt-6 inline-flex items-center gap-2 font-bold text-brand-400">
            {setupDone ? 'Continue setup' : 'Start setup'}
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
        <Link
          to="/how-this-site-works"
          className="group relative overflow-hidden rounded-3xl border-2 border-line bg-surface p-7 shadow-soft transition-all hover:-translate-y-1 hover:border-teal-400 sm:p-9"
        >
          <div className="absolute -bottom-12 -right-12 h-48 w-48 rounded-full bg-teal-400/20 blur-2xl" aria-hidden="true" />
          <Cloud className="h-10 w-10 text-teal-600" aria-hidden="true" />
          <h2 className="mt-4 text-2xl font-extrabold sm:text-3xl">This site runs on AWS too.</h2>
          <p className="mt-2 max-w-md text-muted">
            A private S3 bucket behind CloudFront, defined in one template. See its architecture and why it costs almost nothing.
          </p>
          <div className="mt-6 flex flex-wrap gap-1.5">
            <ServiceChip slug="s3" />
            <ServiceChip slug="cloudfront" />
            <ServiceChip slug="cloudformation" />
            <ServiceChip slug="iam" />
          </div>
          <span className="mt-6 inline-flex items-center gap-2 font-bold text-teal-700 dark:text-teal-300">
            See how it works
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      </section>

      {/* ------------------------------------------------------------ services cloud */}
      <section className="container-page py-12">
        <SectionHeading eyebrow="The toolbox" title="AWS services you'll meet" align="center">
          Each one has a page with an analogy, key ideas, Free Tier notes and a quick quiz.
        </SectionHeading>
        <div className="mx-auto flex max-w-3xl flex-wrap justify-center gap-2">
          {services.map((s) => (
            <ServiceChip key={s.slug} slug={s.slug} link className="px-3 py-2 text-sm" />
          ))}
        </div>
      </section>
    </>
  );
}
