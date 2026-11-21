import { Suspense, useEffect } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { ArrowRight, Check, Clock, ExternalLink, Github, Hammer, PiggyBank, Play } from 'lucide-react';
import { ArchitectureDiagram } from '@/components/diagram/ArchitectureDiagram';
import { CodePeek } from '@/components/diagram/CodePeek';
import { DiagramProvider, useDiagram } from '@/components/diagram/DiagramContext';
import { FlowPlayer } from '@/components/diagram/FlowPlayer';
import { WhatIfCards } from '@/components/diagram/WhatIfCards';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { CostTable } from '@/components/project/CostTable';
import { MiniDiagram } from '@/components/project/MiniDiagram';
import { NextUp } from '@/components/project/NextUp';
import { SectionNav } from '@/components/project/SectionNav';
import { DifficultyBadge, ServiceChip } from '@/components/ui/Badge';
import { ButtonLink, ExternalButton } from '@/components/ui/Button';
import { Callout } from '@/components/ui/Callout';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { CATEGORIES } from '@/lib/categories';
import { getProject, getService, nextProject, projectMdx } from '@/lib/content';
import { Icon } from '@/lib/icons';
import { inline } from '@/lib/markdown';
import { usePageMeta } from '@/lib/meta';
import { buildGuideId, useProgress } from '@/lib/progress';
import type { Project } from '@/lib/types';
import NotFound from './NotFound';

const SECTIONS = [
  { id: 'what-it-does', label: 'What it does' },
  { id: 'learn', label: "You'll learn" },
  { id: 'architecture', label: 'Architecture' },
  { id: 'services', label: 'Services' },
  { id: 'what-if', label: 'What if...?' },
  { id: 'cost', label: 'Cost' },
  { id: 'faq', label: 'FAQ' },
];

/** Opens the panel for ?node=<id> links (used by service pages and search). */
function DeepLink() {
  const [params] = useSearchParams();
  const { openNode, nodesById } = useDiagram();
  const node = params.get('node');
  useEffect(() => {
    if (node && nodesById.has(node)) {
      const t = window.setTimeout(() => openNode(node), 500);
      return () => window.clearTimeout(t);
    }
  }, [node, nodesById, openNode]);
  return null;
}

function Mdx({ project, name }: { project: Project; name: 'overview' | 'faq' }) {
  const Comp = projectMdx(project.slug, name);
  if (!Comp) return <p className="text-muted">Coming soon.</p>;
  return (
    <Suspense fallback={<div className="h-24 animate-pulse rounded-2xl bg-surface-2" />}>
      <Comp />
    </Suspense>
  );
}

export default function ProjectPage() {
  const { slug } = useParams();
  const project = getProject(slug);
  usePageMeta(project?.title, project?.tagline, project ? `/og/${project.slug}.png` : undefined);
  const built = useProgress((s) => (project ? !!s.guidesCompleted[buildGuideId(project.slug)] : false));
  if (!project) return <NotFound />;

  const next = nextProject(project.slug);
  const shortTitle = project.title.split(':')[0];

  return (
    <DiagramProvider source={project}>
      <DeepLink />
      {/* ------------------------------------------------------------ hero */}
      <section className="relative overflow-hidden border-b border-line">
        <div
          className="dot-grid absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,black,transparent)]"
          aria-hidden="true"
        />
        <div className="container-page relative grid gap-10 pb-12 pt-8 lg:grid-cols-[1.1fr_1fr] lg:items-center lg:pb-16">
          <div>
            <Breadcrumbs items={[{ label: 'Projects', to: '/projects' }, { label: shortTitle }]} />
            <div className="flex flex-wrap items-center gap-2">
              <DifficultyBadge level={project.difficulty} />
              <span className="inline-flex items-center gap-1 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-bold text-muted">
                <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {project.estimatedBuildTime} to build
              </span>
              {built && (
                <span className="inline-flex items-center gap-1 rounded-full bg-teal-100 px-2.5 py-1 text-xs font-bold text-teal-800 dark:bg-teal-900/40 dark:text-teal-200">
                  <Check className="h-3.5 w-3.5" aria-hidden="true" /> You built this
                </span>
              )}
            </div>
            <h1 className="mt-4 text-4xl font-extrabold leading-[1.05] tracking-tight sm:text-5xl">
              {shortTitle}
            </h1>
            {project.title.includes(':') && (
              <p className="mt-1 text-xl font-bold text-brand-700 dark:text-brand-300">
                {project.title.split(':').slice(1).join(':').trim()}
              </p>
            )}
            <p className="mt-4 max-w-xl text-lg leading-relaxed text-muted">{project.tagline}</p>
            <p className="mt-4 flex max-w-xl items-start gap-2 rounded-2xl border border-teal-200 bg-teal-50 px-4 py-3 text-sm text-teal-900 dark:border-teal-800 dark:bg-teal-900/25 dark:text-teal-100">
              <PiggyBank className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>
                <strong>
                  {project.freeTierFriendly.value ? 'Free Tier friendly. ' : 'Watch the cost. '}
                </strong>
                {inline(project.freeTierFriendly.note.replace(/\s*TODO\(verify\)/g, ''))}
              </span>
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <ButtonLink
                to={`/projects/${project.slug}/build`}
                size="lg"
                iconRight={<ArrowRight className="h-5 w-5" />}
              >
                Build it yourself
              </ButtonLink>
              {project.liveDemoUrl && (
                <ExternalButton
                  href={project.liveDemoUrl}
                  size="lg"
                  icon={<ExternalLink className="h-4 w-4" />}
                >
                  Live demo
                </ExternalButton>
              )}
              <ExternalButton href={project.githubUrl} size="lg" icon={<Github className="h-4 w-4" />}>
                GitHub
              </ExternalButton>
            </div>
            <div className="mt-6 flex flex-wrap gap-1.5">
              {project.stack.map((s) => (
                <span
                  key={s}
                  className="rounded-lg bg-surface-2 px-2 py-1 font-mono text-xs font-semibold text-muted"
                >
                  {s}
                </span>
              ))}
            </div>
          </div>
          <div className="relative">
            {project.heroImage ? (
              <img
                src={project.heroImage.src}
                alt={project.heroImage.alt}
                className="w-full rounded-3xl border border-line shadow-lift"
                loading="eager"
              />
            ) : (
              <div className="rounded-3xl border border-line bg-surface p-5 text-navy-900 shadow-lift dark:text-navy-100">
                <MiniDiagram architecture={project.architecture} className="w-full" maxDots={8} />
              </div>
            )}
            <a
              href="#architecture"
              className="absolute -bottom-5 left-1/2 inline-flex -translate-x-1/2 items-center gap-2 whitespace-nowrap rounded-2xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white shadow-lift transition-transform hover:-translate-y-0.5 dark:bg-navy-100 dark:text-navy-950"
            >
              <Play className="h-4 w-4 text-brand-400 dark:text-brand-600" aria-hidden="true" /> Explore the
              live diagram
            </a>
          </div>
        </div>
      </section>

      <div className="pt-8">
        <div className="sticky top-16 z-40">
          <div className="container-page">
            <SectionNav sections={SECTIONS} />
          </div>
        </div>
        <div className="container-page">
          {/* ------------------------------------------------------------ what it does */}
          <section id="what-it-does" className="scroll-mt-32 pt-14">
            <SectionHeading eyebrow="The story" title="What it does" />
            <div className="prose-hub">
              <Mdx project={project} name="overview" />
            </div>
          </section>

          {/* ------------------------------------------------------------ learn */}
          <section id="learn" className="scroll-mt-32 pt-16">
            <SectionHeading eyebrow="Skills" title="What you'll learn" />
            <ul className="grid gap-3 sm:grid-cols-2">
              {project.whatYouLearn.map((w) => (
                <li
                  key={w}
                  className="flex items-start gap-3 rounded-2xl border border-line bg-surface p-4 shadow-soft"
                >
                  <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-lg bg-teal-500 text-navy-950">
                    <Check className="h-4 w-4" strokeWidth={3} aria-hidden="true" />
                  </span>
                  <span className="leading-snug">{inline(w)}</span>
                </li>
              ))}
            </ul>
          </section>
        </div>

        {/* ------------------------------------------------------------ architecture (wider container) */}
        <section
          id="architecture"
          className="mx-auto w-full max-w-[92rem] scroll-mt-32 px-4 pt-16 sm:px-6 lg:px-8"
        >
          <div className="mx-auto max-w-content">
            <SectionHeading eyebrow="How it works" title="The architecture, live">
              Tap a box to see what it does. Pick a flow to watch a request travel through the system.
            </SectionHeading>
          </div>
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
            <ArchitectureDiagram title={`${shortTitle} architecture diagram`} />
            <FlowPlayer className="lg:sticky lg:top-36 lg:max-h-[calc(100vh-10rem)] lg:self-start lg:overflow-y-auto" />
          </div>
        </section>

        <div className="container-page">
          {/* ------------------------------------------------------------ services */}
          <section id="services" className="scroll-mt-32 pt-16">
            <SectionHeading eyebrow="The toolbox" title="Services used, and why" />
            <div className="grid gap-4 md:grid-cols-2">
              {project.services.map((r) => {
                const s = getService(r.serviceSlug);
                if (!s) return null;
                const color = CATEGORIES[s.category].color;
                return (
                  <Link
                    key={r.serviceSlug}
                    to={`/services/${s.slug}`}
                    className="group flex gap-4 rounded-3xl border-2 border-line bg-surface p-5 transition-all hover:-translate-y-1 hover:shadow-lift"
                    style={{ ['--c' as string]: color }}
                  >
                    <span
                      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-white shadow-soft"
                      style={{ backgroundColor: color }}
                    >
                      <Icon name={s.icon} className="h-6 w-6" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center justify-between gap-2">
                        <span className="text-lg font-extrabold">{s.shortName}</span>
                        <span className="text-2xs font-bold uppercase tracking-wider" style={{ color }}>
                          {CATEGORIES[s.category].label}
                        </span>
                      </span>
                      <span className="mt-1 block leading-snug text-ink/85">
                        {inline(r.roleInThisProject)}
                      </span>
                      <span className="mt-2 block text-sm italic leading-snug text-muted">"{r.analogy}"</span>
                      <span className="mt-3 inline-flex items-center gap-1 text-sm font-bold text-brand-700 dark:text-brand-300">
                        Learn {s.shortName}
                        <ArrowRight
                          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1"
                          aria-hidden="true"
                        />
                      </span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* ------------------------------------------------------------ what if */}
          <section id="what-if" className="scroll-mt-32 pt-16">
            <SectionHeading eyebrow="Think like an architect" title="What if...?">
              Open a question to see the answer. The boxes involved light up on the diagram.
            </SectionHeading>
            <WhatIfCards items={project.whatIfs} />
          </section>

          {/* ------------------------------------------------------------ cost */}
          <section id="cost" className="scroll-mt-32 pt-16">
            <SectionHeading eyebrow="Money" title="What it costs" />
            <CostTable lines={project.costBreakdown} />
            <Callout type="cost" title="Set a billing alarm before you build">
              <p>
                Free Tier limits and prices change. Numbers marked "to verify" still need checking against the{' '}
                <a href="https://aws.amazon.com/pricing/" target="_blank" rel="noopener noreferrer">
                  AWS pricing pages
                </a>
                . A <Link to="/setup/billing-alarm">billing alarm</Link> emails you long before a small
                mistake becomes a big bill.
              </p>
            </Callout>
          </section>

          {/* ------------------------------------------------------------ faq */}
          <section id="faq" className="scroll-mt-32 pt-16">
            <SectionHeading eyebrow="Questions" title={`${shortTitle} FAQ`} />
            <Mdx project={project} name="faq" />
          </section>

          {/* ------------------------------------------------------------ CTA */}
          <section className="mt-20 overflow-hidden rounded-[2rem] bg-navy-900 p-8 text-white shadow-lift sm:p-12">
            <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
              <div>
                <p className="eyebrow !text-brand-400">Ready?</p>
                <h2 className="mt-2 text-3xl font-extrabold sm:text-4xl">Build {shortTitle} yourself</h2>
                <p className="mt-3 max-w-xl text-white/75">
                  About {project.estimatedBuildTime}, every command copy-pasteable, with checkpoints so you
                  always know it is working.
                </p>
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {[...new Set(project.services.map((s) => s.serviceSlug))].map((s) => (
                    <ServiceChip key={s} slug={s} className="bg-white/10" />
                  ))}
                </div>
              </div>
              <div className="flex flex-col gap-3">
                <ButtonLink
                  to={`/projects/${project.slug}/build`}
                  size="lg"
                  icon={<Hammer className="h-5 w-5" />}
                >
                  Start building
                </ButtonLink>
                {next && (
                  <ButtonLink
                    to={`/projects/${next.slug}`}
                    size="lg"
                    variant="outline"
                    className="!border-white/20 !bg-transparent !text-white hover:!border-brand-400"
                    iconRight={<ArrowRight className="h-5 w-5" />}
                  >
                    Next project: {next.title.split(':')[0]}
                  </ButtonLink>
                )}
              </div>
            </div>
          </section>

          <NextUp
            items={[
              ...project.services.slice(0, 2).map((r) => {
                const s = getService(r.serviceSlug)!;
                return {
                  to: `/services/${s.slug}`,
                  title: `Go deeper: ${s.shortName}`,
                  description: s.oneLiner,
                };
              }),
              {
                to: '/troubleshooting',
                title: 'Stuck on an error?',
                description: 'Paste the error text and find the fix.',
              },
            ]}
          />
        </div>
      </div>
      <CodePeek />
    </DiagramProvider>
  );
}
