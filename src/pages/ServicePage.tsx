import { Suspense } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowRight, BookOpen, ExternalLink, MousePointerClick, Quote } from 'lucide-react';
import { MdxScope } from '@/components/guide/MdxScope';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { PageLoader } from '@/components/layout/Layout';
import { NextUp } from '@/components/project/NextUp';
import { CATEGORIES } from '@/lib/categories';
import { getService, projects, serviceMdx, services } from '@/lib/content';
import { Icon } from '@/lib/icons';
import { usePageMeta } from '@/lib/meta';
import NotFound from './NotFound';

export default function ServicePage() {
  const { slug } = useParams();
  const service = getService(slug);
  usePageMeta(service?.name, service ? `${service.oneLiner} ${service.analogy}` : undefined);
  if (!service) return <NotFound />;

  const color = CATEGORIES[service.category].color;
  const Body = serviceMdx(service.slug);
  const sightings = projects.flatMap((p) =>
    p.architecture.nodes
      .filter((n) => n.serviceSlug === service.slug)
      .map((n) => ({
        project: p,
        node: n,
        role: n.description ?? p.services.find((r) => r.serviceSlug === service.slug)?.roleInThisProject ?? '',
      })),
  );
  const related = services.filter((s) => s.category === service.category && s.slug !== service.slug).slice(0, 2);
  const i = services.findIndex((s) => s.slug === service.slug);
  const nextService = services[(i + 1) % services.length];

  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ label: 'Services', to: '/services' }, { label: service.shortName }]} />

      {/* Illustration-style header */}
      <header
        className="relative overflow-hidden rounded-[2rem] p-7 text-white shadow-lift sm:p-10"
        style={{ background: `linear-gradient(135deg, ${color} 0%, ${color}D9 45%, #0F1B2D 130%)` }}
      >
        <svg className="absolute inset-0 h-full w-full opacity-[0.14]" aria-hidden="true">
          <defs>
            <pattern id="svc-dots" width="22" height="22" patternUnits="userSpaceOnUse">
              <circle cx="2" cy="2" r="1.6" fill="white" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#svc-dots)" />
        </svg>
        <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border-[28px] border-white/10" aria-hidden="true" />
        <div className="absolute -bottom-24 right-24 h-56 w-56 rounded-full bg-white/10" aria-hidden="true" />
        <div className="relative grid gap-8 md:grid-cols-[auto_1fr] md:items-center">
          <span className="flex h-24 w-24 items-center justify-center rounded-[1.75rem] bg-white/15 shadow-lift ring-4 ring-white/20 backdrop-blur sm:h-28 sm:w-28">
            <Icon name={service.icon} className="h-12 w-12 sm:h-14 sm:w-14" />
          </span>
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/80">{CATEGORIES[service.category].label}</p>
            <h1 className="mt-1 text-4xl font-extrabold tracking-tight sm:text-5xl">{service.shortName}</h1>
            <p className="text-sm font-semibold text-white/75">{service.name}</p>
            <p className="mt-4 max-w-2xl text-lg font-semibold leading-relaxed sm:text-xl">{service.oneLiner}</p>
          </div>
        </div>
        <div className="relative mt-8 flex max-w-2xl items-start gap-3 rounded-2xl bg-white/12 p-4 backdrop-blur-sm" style={{ backgroundColor: 'rgb(255 255 255 / 0.12)' }}>
          <Quote className="h-6 w-6 shrink-0 text-white/80" aria-hidden="true" />
          <p className="text-[1.02rem] leading-relaxed">
            <span className="font-bold">Think of it like </span>
            {service.analogy.charAt(0).toLowerCase() + service.analogy.slice(1)}
          </p>
        </div>
      </header>

      <div className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_300px]">
        <article className="prose-hub max-w-none">
          {Body ? (
            <Suspense fallback={<PageLoader />}>
              <MdxScope>
                <Body />
              </MdxScope>
            </Suspense>
          ) : (
            <p className="text-muted">This page is being written.</p>
          )}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="card-base p-5">
            <h2 className="flex items-center gap-2 font-bold">
              <MousePointerClick className="h-5 w-5" style={{ color }} aria-hidden="true" /> See it in action
            </h2>
            {sightings.length ? (
              <ul className="mt-3 space-y-2">
                {sightings.map(({ project, node, role }) => (
                  <li key={`${project.slug}-${node.id}`}>
                    <Link
                      to={`/projects/${project.slug}?node=${node.id}#architecture`}
                      className="group block rounded-2xl border border-line p-3 transition-colors hover:border-brand-400"
                    >
                      <span className="block text-2xs font-bold uppercase tracking-wider text-muted">{project.title.split(':')[0]}</span>
                      <span className="flex items-center justify-between font-bold text-ink">
                        {node.label}
                        <ArrowRight className="h-4 w-4 text-muted transition-transform group-hover:translate-x-1" aria-hidden="true" />
                      </span>
                      <span className="mt-0.5 line-clamp-2 block text-xs leading-snug text-muted">{role.replace(/[`*]/g, '')}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-muted">
                Used by <Link to="/how-this-site-works" className="text-link">this very site</Link>.
              </p>
            )}
          </div>
          <a
            href={service.docsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="card-base flex items-center gap-3 p-4 font-bold transition-colors hover:border-brand-400"
          >
            <BookOpen className="h-5 w-5 text-muted" aria-hidden="true" />
            <span className="flex-1">Official {service.shortName} docs</span>
            <ExternalLink className="h-4 w-4 text-muted" aria-hidden="true" />
          </a>
        </aside>
      </div>

      <NextUp
        items={[
          ...related.map((s) => ({ to: `/services/${s.slug}`, title: `Related: ${s.shortName}`, description: s.oneLiner })),
          ...(related.length < 2 && nextService ? [{ to: `/services/${nextService.slug}`, title: `Next: ${nextService.shortName}`, description: nextService.oneLiner }] : []),
          ...(sightings[0] ? [{ to: `/projects/${sightings[0].project.slug}`, title: `Explore ${sightings[0].project.title.split(':')[0]}`, description: sightings[0].project.tagline }] : []),
        ]}
      />
    </div>
  );
}
