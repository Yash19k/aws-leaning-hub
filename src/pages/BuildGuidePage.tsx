import { useParams } from 'react-router-dom';
import { ArrowRight, Clock, Github, Layers } from 'lucide-react';
import { GuideShell } from '@/components/guide/GuideShell';
import { NextUp } from '@/components/project/NextUp';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { ButtonLink, ExternalButton } from '@/components/ui/Button';
import { getProject, nextProject, projectMdx } from '@/lib/content';
import { usePageMeta } from '@/lib/meta';
import { buildGuideId } from '@/lib/progress';
import NotFound from './NotFound';

export default function BuildGuidePage() {
  const { slug } = useParams();
  const project = getProject(slug);
  usePageMeta(project ? `Build ${project.title.split(':')[0]}` : undefined, project ? `Step-by-step guide to build and deploy ${project.title} on AWS.` : undefined);
  if (!project) return <NotFound />;
  const short = project.title.split(':')[0];
  const next = nextProject(project.slug);

  return (
    <GuideShell
      guideId={buildGuideId(project.slug)}
      crumbs={[
        { label: 'Projects', to: '/projects' },
        { label: short, to: `/projects/${project.slug}` },
        { label: 'Build it' },
      ]}
      eyebrow="Build guide"
      title={`Build ${short} yourself`}
      intro={<p>{project.tagline} Tick each step as you go; your progress is saved in this browser.</p>}
      meta={
        <>
          <DifficultyBadge level={project.difficulty} />
          <Badge icon={<Clock className="h-3.5 w-3.5" />}>{project.estimatedBuildTime}</Badge>
          <Badge icon={<Layers className="h-3.5 w-3.5" />}>{project.iac === 'sam' ? 'AWS SAM' : 'Terraform'}</Badge>
          <a href={project.githubUrl} target="_blank" rel="noopener noreferrer" data-plain>
            <Badge tone="navy" icon={<Github className="h-3.5 w-3.5" />}>Source code</Badge>
          </a>
        </>
      }
      Content={projectMdx(project.slug, 'build')}
      completion={
        <div className="flex flex-col justify-center gap-3 sm:flex-row">
          <ButtonLink to="/progress">See your badges</ButtonLink>
          {next && (
            <ButtonLink to={`/projects/${next.slug}`} variant="outline" iconRight={<ArrowRight className="h-4 w-4" />}>
              Next: {next.title.split(':')[0]}
            </ButtonLink>
          )}
        </div>
      }
      after={
        <>
          <div className="mt-10 flex flex-wrap gap-3">
            <ButtonLink to={`/projects/${project.slug}`} variant="outline">Back to the architecture</ButtonLink>
            <ExternalButton href={project.githubUrl} icon={<Github className="h-4 w-4" />}>Open the repo</ExternalButton>
          </div>
          <NextUp
            items={[
              ...(next ? [{ to: `/projects/${next.slug}`, title: `Next project: ${next.title.split(':')[0]}`, description: next.tagline }] : []),
              { to: '/troubleshooting', title: 'Hit an error?', description: 'Paste the error text to find what it means and how to fix it.' },
              { to: '/faq', title: 'Questions about cost or safety?', description: 'The beginner FAQ covers billing, keys and more.' },
            ]}
          />
        </>
      }
    />
  );
}
