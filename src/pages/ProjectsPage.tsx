import { Link } from 'react-router-dom';
import { Breadcrumbs } from '@/components/layout/Breadcrumbs';
import { ComingSoonCard, ProjectCard } from '@/components/project/ProjectCard';
import { DifficultyBadge, ServiceChip } from '@/components/ui/Badge';
import { SectionHeading } from '@/components/ui/SectionHeading';
import { DIFFICULTY } from '@/lib/categories';
import { comingSoon, projects } from '@/lib/content';
import { usePageMeta } from '@/lib/meta';

export default function ProjectsPage() {
  usePageMeta('Projects', 'Real serverless AWS projects you can explore box by box and build yourself.');
  const ordered = [...projects].sort((a, b) => DIFFICULTY[a.difficulty].rank - DIFFICULTY[b.difficulty].rank || a.order - b.order);
  return (
    <div className="container-page pt-8">
      <Breadcrumbs items={[{ label: 'Projects' }]} />
      <header className="mb-10 max-w-2xl">
        <p className="eyebrow mb-2">Pick a project</p>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl">Real apps, taken apart</h1>
        <p className="mt-4 text-lg leading-relaxed text-muted">
          Each one is a complete, working app. Explore the architecture first, then build it in your own account.
        </p>
      </header>
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {ordered.map((p, i) => (
          <ProjectCard key={p.slug} project={p} index={i} ribbon={i === 0 ? 'Start here' : undefined} />
        ))}
        {comingSoon.map((c) => (
          <ComingSoonCard key={c.slug} project={c} />
        ))}
      </div>

      <section className="mt-16">
        <SectionHeading eyebrow="Compare" title="Which one should I pick?" />
        <div className="card-base overflow-x-auto">
          <table className="w-full min-w-[640px] text-left text-sm">
            <thead className="bg-surface-2">
              <tr>
                <th scope="col" className="px-5 py-3 font-bold">Project</th>
                <th scope="col" className="px-5 py-3 font-bold">Level</th>
                <th scope="col" className="px-5 py-3 font-bold">Build time</th>
                <th scope="col" className="px-5 py-3 font-bold">Infrastructure</th>
                <th scope="col" className="px-5 py-3 font-bold">Services</th>
              </tr>
            </thead>
            <tbody>
              {ordered.map((p) => (
                <tr key={p.slug} className="border-t border-line align-top">
                  <th scope="row" className="px-5 py-4">
                    <Link to={`/projects/${p.slug}`} className="text-link">{p.title.split(':')[0]}</Link>
                    <p className="mt-1 max-w-xs text-xs font-normal leading-snug text-muted">{p.tagline}</p>
                  </th>
                  <td className="px-5 py-4"><DifficultyBadge level={p.difficulty} /></td>
                  <td className="px-5 py-4 font-semibold">{p.estimatedBuildTime}</td>
                  <td className="px-5 py-4 font-semibold">{p.iac === 'sam' ? 'AWS SAM' : 'Terraform'}</td>
                  <td className="px-5 py-4">
                    <div className="flex flex-wrap gap-1">
                      {[...new Set(p.services.map((s) => s.serviceSlug))].map((s) => (
                        <ServiceChip key={s} slug={s} />
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
