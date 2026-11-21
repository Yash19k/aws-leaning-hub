/**
 * Content validator. Run with `npm run validate` (also runs before every build).
 *
 * Fails (exit 1) when a reference is broken: serviceSlug, nodeId, edgeId, prerequisite
 * slug, guide slug, internal link, unknown MDX component, MDX syntax error, overlapping
 * diagram boxes, or a code peek that doesn't match the real source in source-projects/.
 * Warns about TODO(verify) markers so a human can check them before launch.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { compile } from '@mdx-js/mdx';
import { MDX_COMPONENT_NAMES } from '../src/components/guide/mdx-names';
import type { FaqItem, Project, ServiceMeta, SetupGuide, TroubleshootingItem, ComingSoonProject } from '../src/lib/types';
import { mdxOptions } from './mdx-options';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CONTENT = path.join(ROOT, 'src', 'content');
const SOURCES = path.join(ROOT, 'source-projects');

const errors: string[] = [];
const warnings: string[] = [];
let todoCount = 0;
const err = (where: string, msg: string) => errors.push(`${where}: ${msg}`);
const warn = (where: string, msg: string) => warnings.push(`${where}: ${msg}`);
const rel = (p: string) => path.relative(ROOT, p).replace(/\\/g, '/');

async function load<T>(file: string, name = 'default'): Promise<T> {
  const mod = await import(pathToFileURL(file).href);
  return mod[name] as T;
}

function dupes(values: string[]): string[] {
  const seen = new Set<string>();
  const out = new Set<string>();
  values.forEach((v) => (seen.has(v) ? out.add(v) : seen.add(v)));
  return [...out];
}

function countTodos(text: string) {
  return (text.match(/TODO\(verify\)/g) ?? []).length;
}

// ------------------------------------------------------------------ load registries
const services = await load<ServiceMeta[]>(path.join(CONTENT, 'services', 'services.ts'), 'serviceMeta');
const guides = await load<SetupGuide[]>(path.join(CONTENT, 'setup', 'guides.ts'), 'setupGuides');
const faq = await load<FaqItem[]>(path.join(CONTENT, 'faq', 'faq.ts'), 'faqItems');
const trouble = await load<TroubleshootingItem[]>(path.join(CONTENT, 'troubleshooting', 'troubleshooting.ts'), 'troubleshootingItems');
const coming = await load<ComingSoonProject[]>(path.join(CONTENT, 'coming-soon.ts'), 'comingSoon');

const serviceSlugs = new Set(services.map((s) => s.slug));
const guideSlugs = new Set(guides.map((g) => g.slug));

const projectsDir = path.join(CONTENT, 'projects');
const projectFolders = readdirSync(projectsDir).filter((d) => statSync(path.join(projectsDir, d)).isDirectory());
const projects: Project[] = [];
for (const folder of projectFolders) {
  const file = path.join(projectsDir, folder, 'project.ts');
  if (!existsSync(file)) {
    err(`projects/${folder}`, 'missing project.ts');
    continue;
  }
  try {
    const p = await load<Project>(file);
    if (p.slug !== folder) err(`projects/${folder}`, `slug "${p.slug}" must match the folder name`);
    projects.push(p);
  } catch (e) {
    err(`projects/${folder}/project.ts`, `failed to load: ${(e as Error).message}`);
  }
}
const projectSlugs = new Set(projects.map((p) => p.slug));

// ------------------------------------------------------------------ routes (for link checks)
function routeExists(raw: string): boolean {
  const url = raw.split(/[?#]/)[0].replace(/\/$/, '') || '/';
  // A path with a file extension is a static file: it must exist in public/.
  if (/\.[a-z0-9]{2,5}$/i.test(url)) return existsSync(path.join(ROOT, 'public', url));
  const fixed = ['/', '/projects', '/setup', '/services', '/faq', '/troubleshooting', '/progress', '/how-this-site-works', '/styleguide', '/404'];
  if (fixed.includes(url)) return true;
  let m = /^\/projects\/([^/]+)(\/build)?$/.exec(url);
  if (m) return projectSlugs.has(m[1]);
  m = /^\/setup\/([^/]+)$/.exec(url);
  if (m) return guideSlugs.has(m[1]);
  m = /^\/services\/([^/]+)$/.exec(url);
  if (m) return serviceSlugs.has(m[1]);
  return false;
}

function checkLinks(where: string, text: string) {
  const re = /\]\((\/[^)\s]*)\)|(?:href|to)=["'](\/[^"']*)["']/g;
  for (const m of text.matchAll(re)) {
    const link = m[1] ?? m[2];
    if (!routeExists(link)) err(where, `broken internal link ${link}`);
  }
}

// ------------------------------------------------------------------ services, guides, faq, troubleshooting
for (const d of dupes(services.map((s) => s.slug))) err('services.ts', `duplicate slug ${d}`);
for (const s of services) {
  if (!existsSync(path.join(CONTENT, 'services', `${s.slug}.mdx`))) err(`services/${s.slug}`, 'missing page body services/<slug>.mdx');
}
for (const d of dupes(guides.map((g) => g.slug))) err('guides.ts', `duplicate slug ${d}`);
for (const d of dupes(guides.map((g) => String(g.order)))) err('guides.ts', `duplicate order ${d}`);
for (const g of guides) {
  if (!existsSync(path.join(CONTENT, 'setup', `${g.slug}.mdx`))) err(`setup/${g.slug}`, 'missing guide body setup/<slug>.mdx');
  for (const p of g.neededFor ?? []) if (!projectSlugs.has(p)) err(`setup/${g.slug}`, `neededFor references unknown project "${p}"`);
}
const faqGroups = new Set(['account', 'safety', 'learning', 'projects', 'certifications']);
for (const d of dupes(faq.map((f) => f.id))) err('faq.ts', `duplicate id ${d}`);
for (const f of faq) {
  if (!faqGroups.has(f.group)) err(`faq.ts#${f.id}`, `unknown group "${f.group}"`);
  checkLinks(`faq.ts#${f.id}`, f.answer);
  todoCount += countTodos(f.answer);
}
for (const d of dupes(trouble.map((t) => t.id))) err('troubleshooting.ts', `duplicate id ${d}`);
for (const t of trouble) {
  for (const p of t.relatedProjects) if (!projectSlugs.has(p)) err(`troubleshooting.ts#${t.id}`, `unknown related project "${p}"`);
  [t.cause, ...t.fix].forEach((x) => {
    checkLinks(`troubleshooting.ts#${t.id}`, x);
    todoCount += countTodos(x);
  });
  if (!t.fix.length) err(`troubleshooting.ts#${t.id}`, 'needs at least one fix step');
}
for (const c of coming) for (const s of c.services) if (!serviceSlugs.has(s)) err(`coming-soon.ts#${c.slug}`, `unknown service "${s}"`);

// ------------------------------------------------------------------ projects
const NODE = { desktop: { w: 176, h: 64 }, mobile: { w: 156, h: 60 } };

function checkOverlap(where: string, p: Project, mode: 'desktop' | 'mobile') {
  const pos = p.architecture.nodes.map((n) => ({
    id: n.id,
    ...(mode === 'desktop' ? n.position : (n.mobilePosition ?? { x: n.position.y, y: n.position.x })),
  }));
  const { w, h } = NODE[mode];
  for (let i = 0; i < pos.length; i++) {
    for (let j = i + 1; j < pos.length; j++) {
      const a = pos[i];
      const b = pos[j];
      if (Math.abs(a.x - b.x) < w + 12 && Math.abs(a.y - b.y) < h + 12) {
        err(where, `${mode} layout: boxes "${a.id}" and "${b.id}" overlap (keep ${w + 12}px apart horizontally or ${h + 12}px vertically)`);
      }
    }
  }
  if (mode === 'mobile') {
    const xs = pos.map((p2) => p2.x);
    const width = Math.max(...xs) - Math.min(...xs) + w;
    if (width > 420) warn(where, `mobile layout is ${width}px wide; keep it to 2 columns (x = 0 or 200) so it stays readable on phones`);
  }
}

function sourceFile(p: Project, filePath: string): string | null {
  const base = path.join(SOURCES, p.sourceFolder);
  if (!existsSync(base)) return null;
  return path.join(base, filePath);
}

for (const p of projects) {
  const where = `projects/${p.slug}`;
  const dir = path.join(projectsDir, p.slug);
  for (const f of ['overview.mdx', 'build.mdx', 'faq.mdx']) if (!existsSync(path.join(dir, f))) err(where, `missing ${f}`);

  const required: (keyof Project)[] = ['title', 'tagline', 'difficulty', 'estimatedBuildTime', 'githubUrl', 'githubBranch', 'sourceFolder', 'iac'];
  for (const k of required) if (!p[k]) err(where, `missing ${k}`);
  if (!p.whatYouLearn?.length) err(where, 'whatYouLearn is empty');
  if (p.heroImage && !existsSync(path.join(ROOT, 'public', p.heroImage.src))) err(where, `heroImage ${p.heroImage.src} not found in public/`);

  // services
  for (const d of dupes(p.services.map((s) => s.serviceSlug))) err(where, `service "${d}" listed twice in services[]`);
  for (const s of p.services) {
    if (!serviceSlugs.has(s.serviceSlug)) err(where, `services[] references unknown serviceSlug "${s.serviceSlug}"`);
    if (!s.roleInThisProject || !s.analogy || !s.whyNotAlternative) err(where, `service "${s.serviceSlug}" needs roleInThisProject, analogy and whyNotAlternative`);
  }
  const roleSlugs = new Set(p.services.map((s) => s.serviceSlug));

  // nodes + edges
  const nodeIds = new Set(p.architecture.nodes.map((n) => n.id));
  const edgeIds = new Set(p.architecture.edges.map((e) => e.id));
  for (const d of dupes(p.architecture.nodes.map((n) => n.id))) err(where, `duplicate node id "${d}"`);
  for (const d of dupes(p.architecture.edges.map((e) => e.id))) err(where, `duplicate edge id "${d}"`);
  for (const n of p.architecture.nodes) {
    if (n.kind === 'service') {
      if (!n.serviceSlug) err(where, `node "${n.id}" is a service node but has no serviceSlug`);
      else if (!serviceSlugs.has(n.serviceSlug)) err(where, `node "${n.id}" references unknown serviceSlug "${n.serviceSlug}"`);
      else if (!roleSlugs.has(n.serviceSlug) && !n.description) err(where, `node "${n.id}" uses "${n.serviceSlug}", which is not in services[]; add it there or give the node a description`);
    } else if (!n.description) {
      err(where, `node "${n.id}" (${n.kind}) needs a description`);
    }
    if (n.label.length > 24) warn(where, `node "${n.id}" label "${n.label}" is long and may be cut off (max ~22 chars)`);
  }
  const pairs = new Set<string>();
  for (const e of p.architecture.edges) {
    if (!nodeIds.has(e.source)) err(where, `edge "${e.id}" source "${e.source}" is not a node`);
    if (!nodeIds.has(e.target)) err(where, `edge "${e.id}" target "${e.target}" is not a node`);
    const key = [e.source, e.target].sort().join('|');
    if (pairs.has(key)) warn(where, `two edges connect ${e.source} and ${e.target}; use one edge and reverse: true in flows`);
    pairs.add(key);
  }
  checkOverlap(where, p, 'desktop');
  checkOverlap(where, p, 'mobile');

  // flows
  for (const d of dupes(p.flows.map((f) => f.id))) err(where, `duplicate flow id "${d}"`);
  if (!p.flows.length) err(where, 'needs at least one flow');
  for (const f of p.flows) {
    if (!f.steps.length) err(where, `flow "${f.id}" has no steps`);
    f.steps.forEach((s, i) => {
      const at = `${where} flow "${f.id}" step ${i + 1}`;
      if (!!s.edgeId === !!s.nodeId) err(at, 'needs exactly one of edgeId or nodeId');
      if (s.edgeId && !edgeIds.has(s.edgeId)) err(at, `unknown edgeId "${s.edgeId}"`);
      if (s.nodeId && !nodeIds.has(s.nodeId)) err(at, `unknown nodeId "${s.nodeId}"`);
      if (!s.title || !s.explanation) err(at, 'needs a title and explanation');
      if (s.explanation.length > 320) warn(at, 'explanation is long; keep it to one or two sentences');
    });
  }

  // what-ifs
  for (const d of dupes(p.whatIfs.map((w) => w.id))) err(where, `duplicate whatIf id "${d}"`);
  for (const w of p.whatIfs) {
    for (const id of w.relatedNodeIds) if (!nodeIds.has(id)) err(where, `whatIf "${w.id}" references unknown node "${id}"`);
    checkLinks(`${where} whatIf "${w.id}"`, w.answer);
  }

  // code peeks
  for (const d of dupes(p.codePeeks.map((c) => c.id))) err(where, `duplicate codePeek id "${d}"`);
  for (const c of p.codePeeks) {
    const at = `${where} codePeek "${c.id}"`;
    if (!nodeIds.has(c.nodeId)) err(at, `unknown nodeId "${c.nodeId}"`);
    const lines = c.code.split('\n');
    for (const n of c.highlightLines ?? []) if (n < 1 || n > lines.length) err(at, `highlight line ${n} is outside the snippet (1-${lines.length})`);
    const file = sourceFile(p, c.filePath);
    if (file === null) {
      if (!p.hidden) warn(at, `source-projects/${p.sourceFolder} not found; skipped checking the snippet against the real code`);
      continue;
    }
    if (!existsSync(file)) {
      err(at, `filePath "${c.filePath}" does not exist in source-projects/${p.sourceFolder}`);
      continue;
    }
    const src = readFileSync(file, 'utf8').replace(/\r\n/g, '\n');
    const srcLines = new Set(src.split('\n').map((l) => l.trim()));
    const missing = lines
      .map((l) => l.trim())
      .filter((l) => l && !/^(\.\.\.|…|# \.\.\.|\/\/ \.\.\.)$/.test(l))
      .filter((l) => !srcLines.has(l));
    if (missing.length) err(at, `snippet lines not found in ${c.filePath} (code peeks must be copied from the real source):\n      ${missing.slice(0, 3).join('\n      ')}`);
  }

  // prerequisites + cost
  for (const g of p.prerequisites) if (!guideSlugs.has(g)) err(where, `prerequisite "${g}" is not a setup guide`);
  if (!p.costBreakdown.length) err(where, 'costBreakdown is empty');
  for (const c of p.costBreakdown) {
    for (const cell of [c.freeTierCovers, c.beyondFreeTier]) {
      if (/\d/.test(cell) && !cell.includes('TODO(verify)')) warn(where, `cost "${c.service}": numbers should carry TODO(verify) until checked ("${cell}")`);
    }
  }
  todoCount += countTodos(JSON.stringify(p));
}

// ------------------------------------------------------------------ MDX files
const allowed = new Set<string>(MDX_COMPONENT_NAMES);
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const full = path.join(dir, f);
    return statSync(full).isDirectory() ? walk(full) : full.endsWith('.mdx') ? [full] : [];
  });
}
for (const file of walk(CONTENT)) {
  const where = rel(file);
  const src = readFileSync(file, 'utf8');
  todoCount += countTodos(src);
  try {
    await compile(src, { ...mdxOptions, jsx: true });
  } catch (e) {
    const m = e as { message?: string; line?: number; column?: number };
    err(where, `MDX syntax error${m.line ? ` at ${m.line}:${m.column}` : ''}: ${m.message}`);
    continue;
  }
  // Ignore code: fenced blocks, template-literal props (code={`...`}) and inline code.
  const codeless = src
    .replace(/```[\s\S]*?```/g, '')
    .replace(/=\{`(?:\\`|[^`])*`\}/g, '={``}')
    .replace(/`[^`\n]*`/g, '');
  for (const m of codeless.matchAll(/<([A-Z][A-Za-z0-9]*)/g)) {
    if (!allowed.has(m[1])) err(where, `unknown component <${m[1]}> (available: ${MDX_COMPONENT_NAMES.join(', ')})`);
  }
  for (const m of codeless.matchAll(/<Prerequisite\s+slug=["']([^"']+)["']/g)) {
    if (!guideSlugs.has(m[1])) err(where, `<Prerequisite slug="${m[1]}"> is not a setup guide`);
  }
  const steps = [...codeless.matchAll(/<Step\s+number=\{(\d+)\}/g)].map((m) => Number(m[1]));
  for (const d of dupes(steps.map(String))) err(where, `duplicate <Step number={${d}}>`);
  steps.forEach((n, i) => {
    if (n !== i + 1) err(where, `steps must be numbered 1, 2, 3... in order (found ${n} at position ${i + 1})`);
  });
  for (const m of codeless.matchAll(/<ServiceChip\s+slug=["']([^"']+)["']/g)) {
    if (!serviceSlugs.has(m[1])) err(where, `<ServiceChip slug="${m[1]}"> is not a service`);
  }
  checkLinks(where, codeless);
}

// ------------------------------------------------------------------ report
if (warnings.length) {
  console.log(`\n\x1b[33m${warnings.length} warning(s):\x1b[0m`);
  warnings.forEach((w) => console.log(`  - ${w}`));
}
console.log(`\n\x1b[36m${todoCount} TODO(verify) marker(s) need a human check before launch.\x1b[0m`);
if (errors.length) {
  console.error(`\n\x1b[31mContent validation failed with ${errors.length} error(s):\x1b[0m`);
  errors.forEach((e) => console.error(`  x ${e}`));
  process.exit(1);
}
console.log(`\x1b[32mContent OK:\x1b[0m ${projects.length} project(s), ${services.length} services, ${guides.length} setup guides, ${faq.length} FAQ, ${trouble.length} troubleshooting items.\n`);
