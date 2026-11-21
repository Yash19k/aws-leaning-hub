import { Link } from 'react-router-dom';
import { ArrowRight, Clock, Hourglass, PiggyBank } from 'lucide-react';
import { DifficultyBadge, ServiceChip } from '@/components/ui/Badge';
import { cn } from '@/lib/cn';
import type { ComingSoonProject, Project } from '@/lib/types';
import { MiniDiagram } from './MiniDiagram';

export function ProjectCard({ project, ribbon, index = 0 }: { project: Project; ribbon?: string; index?: number }) {
  const uniqueServices = [...new Set(project.services.map((s) => s.serviceSlug))];
  return (
    <Link
      to={`/projects/${project.slug}`}
      className="group relative flex flex-col overflow-hidden rounded-3xl border-2 border-line bg-surface shadow-soft transition-all duration-300 hover:-translate-y-1.5 hover:border-brand-400 hover:shadow-lift"
    >
      {ribbon && (
        <span className="absolute right-4 top-4 z-10 inline-flex items-center gap-1 rounded-full bg-brand-500 px-3 py-1 text-xs font-extrabold text-navy-950 shadow-soft">
          {ribbon}
        </span>
      )}
      <div
        className={cn(
          'relative h-44 overflow-hidden border-b border-line text-navy-900 dark:text-navy-100',
          index % 2 === 0
            ? 'bg-gradient-to-br from-teal-50 via-surface to-brand-50 dark:from-teal-900/20 dark:via-surface dark:to-brand-900/10'
            : 'bg-gradient-to-br from-navy-50 via-surface to-rose-50 dark:from-navy-900/50 dark:via-surface dark:to-rose-900/10',
        )}
      >
        <div className="dot-grid absolute inset-0 opacity-60" />
        <MiniDiagram
          architecture={project.architecture}
          className="absolute inset-0 h-full w-full p-4 transition-transform duration-500 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex flex-wrap items-center gap-2">
          <DifficultyBadge level={project.difficulty} />
          <span className="inline-flex items-center gap-1 text-xs font-bold text-muted">
            <Clock className="h-3.5 w-3.5" aria-hidden="true" /> {project.estimatedBuildTime}
          </span>
          {project.freeTierFriendly.value && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-teal-700 dark:text-teal-300">
              <PiggyBank className="h-3.5 w-3.5" aria-hidden="true" /> Free Tier friendly
            </span>
          )}
        </div>
        <h3 className="mt-3 text-2xl font-extrabold leading-tight">{project.title.split(':')[0]}</h3>
        <p className="mt-1.5 flex-1 leading-relaxed text-muted">{project.tagline}</p>
        <div className="mt-4 flex flex-wrap gap-1.5">
          {uniqueServices.slice(0, 7).map((s) => (
            <ServiceChip key={s} slug={s} />
          ))}
          {uniqueServices.length > 7 && (
            <span className="rounded-lg border border-line px-2 py-1 text-xs font-bold text-muted">+{uniqueServices.length - 7}</span>
          )}
        </div>
        <span className="mt-5 inline-flex items-center gap-1.5 font-bold text-brand-700 dark:text-brand-300">
          Explore the architecture
          <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}

export function ComingSoonCard({ project }: { project: ComingSoonProject }) {
  return (
    <div className="relative flex flex-col overflow-hidden rounded-3xl border-2 border-dashed border-line bg-surface/50 p-5 sm:p-6">
      <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-xs font-bold text-muted">
        <Hourglass className="h-3.5 w-3.5" aria-hidden="true" /> Coming soon
      </span>
      <div className="mt-3 flex items-center gap-2">
        <DifficultyBadge level={project.difficulty} />
      </div>
      <h3 className="mt-3 text-2xl font-extrabold leading-tight text-ink/70">{project.title}</h3>
      <p className="mt-1.5 flex-1 leading-relaxed text-muted">{project.tagline}</p>
      <div className="mt-4 flex flex-wrap gap-1.5 opacity-70">
        {project.services.map((s) => (
          <ServiceChip key={s} slug={s} />
        ))}
      </div>
    </div>
  );
}
