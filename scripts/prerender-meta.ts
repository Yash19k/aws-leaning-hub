/**
 * After `vite build`: write dist/<route>/index.html for every known page, with that page's
 * <title>, description and Open Graph tags. Social-media crawlers don't run JavaScript,
 * so this is what makes shared links show the right preview. A CloudFront Function maps
 * /projects/dropvault -> /projects/dropvault/index.html (see infra/template.yaml).
 */
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Project, ServiceMeta, SetupGuide } from '../src/lib/types';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DIST = path.join(ROOT, 'dist');
const CONTENT = path.join(ROOT, 'src', 'content');
const SITE_NAME = 'AWS Learning Hub';

async function load<T>(file: string, name = 'default'): Promise<T> {
  return (await import(pathToFileURL(file).href))[name] as T;
}

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const strip = (s: string) => s.replace(/\s*TODO\(verify\)/g, '').replace(/[`*]/g, '');

interface Page {
  route: string;
  title: string;
  description: string;
  image?: string;
}

const template = readFileSync(path.join(DIST, 'index.html'), 'utf8');
const services = await load<ServiceMeta[]>(path.join(CONTENT, 'services', 'services.ts'), 'serviceMeta');
const guides = await load<SetupGuide[]>(path.join(CONTENT, 'setup', 'guides.ts'), 'setupGuides');
const projects: Project[] = [];
for (const d of readdirSync(path.join(CONTENT, 'projects'))) {
  const f = path.join(CONTENT, 'projects', d, 'project.ts');
  if (statSync(path.join(CONTENT, 'projects', d)).isDirectory() && existsSync(f)) {
    const p = await load<Project>(f);
    if (!p.hidden) projects.push(p);
  }
}

const pages: Page[] = [
  { route: 'projects', title: 'Projects', description: 'Real serverless AWS projects you can explore box by box and build yourself.' },
  { route: 'setup', title: 'Set up AWS', description: 'Create and secure your AWS account, set a billing alarm and install your tools, one short guide at a time.' },
  { route: 'services', title: 'Service library', description: 'Every AWS service used in the projects, explained with an analogy, key ideas and a quiz.' },
  { route: 'faq', title: 'FAQ', description: 'Beginner questions about AWS accounts, billing, safety, learning paths and certifications.' },
  { route: 'troubleshooting', title: 'Troubleshooting', description: 'Paste an AWS error message to find what it means and how to fix it.' },
  { route: 'progress', title: 'Your progress', description: 'Badges and progress saved in this browser.' },
  { route: 'how-this-site-works', title: 'This site runs on AWS', description: 'A private S3 bucket behind CloudFront, deployed by GitHub Actions with OIDC.' },
  ...projects.flatMap((p) => [
    { route: `projects/${p.slug}`, title: p.title, description: strip(p.tagline), image: `/og/${p.slug}.png` },
    { route: `projects/${p.slug}/build`, title: `Build ${p.title.split(':')[0]}`, description: `Step-by-step guide to build and deploy ${p.title} on AWS.`, image: `/og/${p.slug}.png` },
  ]),
  ...guides.map((g) => ({ route: `setup/${g.slug}`, title: g.title, description: g.summary })),
  ...services.map((s) => ({ route: `services/${s.slug}`, title: s.name, description: `${s.oneLiner} ${s.analogy}` })),
];

function render(page: Page): string {
  const title = `${page.title} · ${SITE_NAME}`;
  const image = page.image && existsSync(path.join(DIST, page.image)) ? page.image : '/og/default.png';
  return template
    .replace(/<title>[^<]*<\/title>/, `<title>${esc(title)}</title>`)
    .replace(/(<meta\s+name="description"\s+content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/(<meta\s+property="og:title"\s+content=")[^"]*(")/, `$1${esc(title)}$2`)
    .replace(/(<meta\s+property="og:description"\s+content=")[^"]*(")/, `$1${esc(page.description)}$2`)
    .replace(/(<meta\s+property="og:image"\s+content=")[^"]*(")/, `$1${image}$2`);
}

for (const page of pages) {
  const dir = path.join(DIST, page.route);
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, 'index.html'), render(page));
}
console.log(`Pre-rendered meta tags for ${pages.length} routes.`);
