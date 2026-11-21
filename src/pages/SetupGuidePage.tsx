import { useParams } from 'react-router-dom';
import { ArrowLeft, ArrowRight, Clock } from 'lucide-react';
import { GuideShell } from '@/components/guide/GuideShell';
import { NextUp } from '@/components/project/NextUp';
import { Badge } from '@/components/ui/Badge';
import { ButtonLink } from '@/components/ui/Button';
import { getProject, getGuide, guides, projects, setupMdx } from '@/lib/content';
import { usePageMeta } from '@/lib/meta';
import { setupGuideId } from '@/lib/progress';
import NotFound from './NotFound';

export default function SetupGuidePage() {
  const { slug } = useParams();
  const guide = getGuide(slug);
  usePageMeta(guide?.title, guide?.summary);
  if (!guide) return <NotFound />;
  const i = guides.findIndex((g) => g.slug === guide.slug);
  const prev = guides[i - 1];
  const next = guides[i + 1];

  return (
    <GuideShell
      key={guide.slug}
      guideId={setupGuideId(guide.slug)}
      crumbs={[{ label: 'Setup', to: '/setup' }, { label: guide.title }]}
      eyebrow={`Setup guide ${i + 1} of ${guides.length}`}
      title={guide.title}
      intro={<p>{guide.summary}</p>}
      meta={
        <>
          <Badge icon={<Clock className="h-3.5 w-3.5" />}>{guide.estimatedTime}</Badge>
          {guide.neededFor?.map((p) => (
            <Badge key={p} tone="navy">
              Needed for {getProject(p)?.title.split(':')[0] ?? p}
            </Badge>
          ))}
        </>
      }
      Content={setupMdx(guide.slug)}
      completion={
        next ? (
          <ButtonLink to={`/setup/${next.slug}`} iconRight={<ArrowRight className="h-4 w-4" />}>
            Next guide: {next.title}
          </ButtonLink>
        ) : (
          <ButtonLink to="/projects" iconRight={<ArrowRight className="h-4 w-4" />}>
            Pick a project to build
          </ButtonLink>
        )
      }
      after={
        <>
          <nav className="mt-10 grid gap-3 sm:grid-cols-2" aria-label="Guide navigation">
            {prev ? (
              <ButtonLink to={`/setup/${prev.slug}`} variant="outline" icon={<ArrowLeft className="h-4 w-4" />} className="justify-start">
                {prev.title}
              </ButtonLink>
            ) : (
              <span />
            )}
            {next && (
              <ButtonLink to={`/setup/${next.slug}`} variant="outline" iconRight={<ArrowRight className="h-4 w-4" />} className="justify-end sm:col-start-2">
                {next.title}
              </ButtonLink>
            )}
          </nav>
          <NextUp
            items={
              next
                ? [{ to: `/setup/${next.slug}`, title: `Next: ${next.title}`, description: next.summary }, { to: '/setup', title: 'Back to the roadmap', description: 'See every setup guide and what you have finished.' }]
                : projects.map((p) => ({ to: `/projects/${p.slug}`, title: p.title.split(':')[0], description: p.tagline }))
            }
          />
        </>
      }
    />
  );
}
