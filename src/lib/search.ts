/** Client-side search index across projects, services, setup guides, FAQ and troubleshooting. */
import type Fuse from 'fuse.js';
import { allProjects, faqItems, guides, projects, rawMdxLoaders, services, troubleshootingItems } from './content';
import { plain } from './markdown';

export type SearchKind = 'project' | 'node' | 'service' | 'guide' | 'step' | 'faq' | 'error' | 'page';

export interface SearchEntry {
  id: string;
  kind: SearchKind;
  title: string;
  subtitle: string;
  href: string;
  keywords: string;
}

export const KIND_LABEL: Record<SearchKind, string> = {
  project: 'Project',
  node: 'Diagram box',
  service: 'Service',
  guide: 'Setup guide',
  step: 'Guide step',
  faq: 'FAQ',
  error: 'Troubleshooting',
  page: 'Page',
};

function staticEntries(): SearchEntry[] {
  const out: SearchEntry[] = [];
  for (const p of projects) {
    out.push({
      id: `project:${p.slug}`,
      kind: 'project',
      title: p.title,
      subtitle: p.tagline,
      href: `/projects/${p.slug}`,
      keywords: [...p.whatYouLearn, ...p.stack].join(' '),
    });
    out.push({
      id: `build:${p.slug}`,
      kind: 'guide',
      title: `Build ${p.title.split(':')[0]} yourself`,
      subtitle: 'Step-by-step build guide',
      href: `/projects/${p.slug}/build`,
      keywords: 'build deploy guide tutorial',
    });
    for (const n of p.architecture.nodes) {
      const role = p.services.find((s) => s.serviceSlug === n.serviceSlug)?.roleInThisProject;
      out.push({
        id: `node:${p.slug}:${n.id}`,
        kind: 'node',
        title: `${n.label} in ${p.title.split(':')[0]}`,
        subtitle: plain(n.description ?? role ?? ''),
        href: `/projects/${p.slug}?node=${n.id}#architecture`,
        keywords: [n.sublabel ?? '', n.serviceSlug ?? ''].join(' '),
      });
    }
    for (const w of p.whatIfs) {
      out.push({
        id: `whatif:${p.slug}:${w.id}`,
        kind: 'faq',
        title: `What if ${w.question.replace(/^what if\s*/i, '')}`,
        subtitle: plain(w.answer).slice(0, 140),
        href: `/projects/${p.slug}#what-if`,
        keywords: '',
      });
    }
  }
  for (const s of services) {
    out.push({
      id: `service:${s.slug}`,
      kind: 'service',
      title: s.name,
      subtitle: s.oneLiner,
      href: `/services/${s.slug}`,
      keywords: `${s.shortName} ${s.analogy} ${s.category}`,
    });
  }
  for (const g of guides) {
    out.push({ id: `guide:${g.slug}`, kind: 'guide', title: g.title, subtitle: g.summary, href: `/setup/${g.slug}`, keywords: 'setup' });
  }
  for (const f of faqItems) {
    out.push({
      id: `faq:${f.id}`,
      kind: 'faq',
      title: f.question,
      subtitle: plain(f.answer).slice(0, 140),
      href: `/faq#${f.id}`,
      keywords: (f.tags ?? []).join(' '),
    });
  }
  for (const t of troubleshootingItems) {
    out.push({
      id: `error:${t.id}`,
      kind: 'error',
      title: t.title,
      subtitle: t.errorMessage,
      href: `/troubleshooting#${t.id}`,
      keywords: `${t.errorMessage} ${(t.keywords ?? []).join(' ')}`,
    });
  }
  out.push(
    { id: 'page:progress', kind: 'page', title: 'Your progress and badges', subtitle: 'Badges you have earned', href: '/progress', keywords: 'badges progress reset' },
    { id: 'page:site', kind: 'page', title: 'How this site runs on AWS', subtitle: 'S3 + CloudFront hosting of this very site', href: '/how-this-site-works', keywords: 'cloudfront s3 hosting oac' },
  );
  return out;
}

/** Pull step titles and FAQ questions out of the raw MDX, so search reaches inside guides. */
async function mdxEntries(): Promise<SearchEntry[]> {
  const out: SearchEntry[] = [];
  const stepRe = /<Step\s+number=\{(\d+)\}\s+title=["']([^"']+)["']/g;
  const faqRe = /<FaqItem\s+q=["']([^"']+)["']/g;
  await Promise.all(
    Object.entries(rawMdxLoaders).map(async ([path, load]) => {
      const setup = /content\/setup\/([^/]+)\.mdx$/.exec(path);
      const build = /content\/projects\/([^/]+)\/build\.mdx$/.exec(path);
      const faq = /content\/projects\/([^/]+)\/faq\.mdx$/.exec(path);
      if (!setup && !build && !faq) return;
      const slug = (setup ?? build ?? faq)![1];
      const project = allProjects.find((p) => p.slug === slug);
      if ((build || faq) && (!project || project.hidden)) return;
      const src = await load();
      if (faq) {
        for (const m of src.matchAll(faqRe)) {
          out.push({ id: `pfaq:${slug}:${m[1]}`, kind: 'faq', title: m[1], subtitle: `${project!.title.split(':')[0]} FAQ`, href: `/projects/${slug}#faq`, keywords: '' });
        }
        return;
      }
      const where = setup ? guides.find((g) => g.slug === slug)?.title ?? slug : `Build ${project!.title.split(':')[0]}`;
      for (const m of src.matchAll(stepRe)) {
        out.push({
          id: `step:${path}:${m[1]}`,
          kind: 'step',
          title: m[2],
          subtitle: `${where} · step ${m[1]}`,
          href: setup ? `/setup/${slug}#step-${m[1]}` : `/projects/${slug}/build#step-${m[1]}`,
          keywords: '',
        });
      }
    }),
  );
  return out;
}

let fusePromise: Promise<Fuse<SearchEntry>> | null = null;

export function loadSearchIndex(): Promise<Fuse<SearchEntry>> {
  if (!fusePromise) {
    fusePromise = (async () => {
      const [{ default: FuseCtor }, extra] = await Promise.all([import('fuse.js'), mdxEntries()]);
      return new FuseCtor([...staticEntries(), ...extra], {
        keys: [
          { name: 'title', weight: 3 },
          { name: 'subtitle', weight: 1 },
          { name: 'keywords', weight: 1 },
        ],
        threshold: 0.36,
        ignoreLocation: true,
        minMatchCharLength: 2,
      });
    })();
  }
  return fusePromise;
}
