/**
 * Generates the Open Graph share images in public/og/ (1200x630 PNG): one default card and
 * one per project. Social sites show these when someone shares a link.
 *
 *   npm run og
 *
 * Needs Google Chrome (or set CHROME_PATH). The PNGs are committed, so CI doesn't run this.
 */
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import puppeteer from 'puppeteer-core';
import type { Project, ServiceMeta } from '../src/lib/types';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT = path.join(ROOT, 'public', 'og');
const CONTENT = path.join(ROOT, 'src', 'content');

const CHROME =
  process.env.CHROME_PATH ??
  [
    'C:/Program Files/Google/Chrome/Application/chrome.exe',
    '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
    '/usr/bin/google-chrome',
    '/usr/bin/chromium',
  ].find((p) => existsSync(p));

const CATEGORY_COLOR: Record<string, string> = {
  storage: '#1F9D55',
  compute: '#E8830C',
  database: '#3B6FE0',
  networking: '#8B5CF6',
  security: '#E5484D',
  management: '#D6409F',
  integration: '#0E9CC9',
  frontend: '#5F9E10',
};

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function card(opts: { eyebrow: string; title: string; subtitle: string; chips: { label: string; color: string }[] }) {
  const chips = opts.chips
    .map((c) => `<span class="chip" style="color:#fff;border-color:${c.color};background:${c.color}55">${esc(c.label)}</span>`)
    .join('');
  return `<!doctype html><html><head><meta charset="utf-8"><style>
  * { box-sizing: border-box; margin: 0; }
  body { width: 1200px; height: 630px; font-family: 'Segoe UI', system-ui, -apple-system, Roboto, sans-serif;
    background: #0F1B2D; color: #fff; position: relative; overflow: hidden; }
  .glow1 { position: absolute; width: 620px; height: 620px; border-radius: 50%; background: #FF990044; filter: blur(120px); top: -260px; right: -160px; }
  .glow2 { position: absolute; width: 520px; height: 520px; border-radius: 50%; background: #14B09F33; filter: blur(120px); bottom: -280px; left: -120px; }
  .dots { position: absolute; inset: 0; background-image: radial-gradient(#ffffff22 1.5px, transparent 1.5px); background-size: 28px 28px; }
  .wrap { position: relative; padding: 64px 72px; height: 100%; display: flex; flex-direction: column; }
  .brand { display: flex; align-items: center; gap: 16px; font-size: 28px; font-weight: 800; }
  .logo { width: 60px; height: 60px; border-radius: 16px; background: #172540; display: flex; align-items: center; justify-content: center; }
  .brand b { color: #FF9900; }
  .eyebrow { margin-top: 56px; font-size: 24px; font-weight: 800; letter-spacing: 0.14em; text-transform: uppercase; color: #FFC04D; }
  h1 { margin-top: 14px; font-size: 76px; line-height: 1.03; font-weight: 800; letter-spacing: -0.03em; max-width: 1000px; }
  p { margin-top: 22px; font-size: 30px; line-height: 1.35; color: #D8E0EF; max-width: 960px; }
  .chips { margin-top: auto; display: flex; flex-wrap: wrap; gap: 12px; }
  .chip { font-size: 22px; font-weight: 800; padding: 8px 16px; border: 2px solid; border-radius: 14px; }
  .bar { position: absolute; left: 0; right: 0; bottom: 0; height: 10px; background: linear-gradient(90deg, #14B09F, #FF9900); }
  </style></head><body>
  <div class="glow1"></div><div class="glow2"></div><div class="dots"></div>
  <div class="wrap">
    <div class="brand"><span class="logo"><svg viewBox="0 0 64 64" width="44" height="44">
      <path d="M18 38c8 6 20 6 28 0" fill="none" stroke="#FF9900" stroke-width="5" stroke-linecap="round"/>
      <path d="M42 34l5 4-6 2" fill="none" stroke="#FF9900" stroke-width="4" stroke-linecap="round" stroke-linejoin="round"/>
      <circle cx="22" cy="24" r="5" fill="#34C8B6"/><circle cx="42" cy="24" r="5" fill="#fff"/></svg></span>
      <span>AWS <b>Learning</b> Hub</span></div>
    <div class="eyebrow">${esc(opts.eyebrow)}</div>
    <h1>${esc(opts.title)}</h1>
    <p>${esc(opts.subtitle)}</p>
    <div class="chips">${chips}</div>
  </div><div class="bar"></div></body></html>`;
}

async function load<T>(file: string, name = 'default'): Promise<T> {
  return (await import(pathToFileURL(file).href))[name] as T;
}

if (!CHROME) {
  console.error('Chrome not found. Set CHROME_PATH to a Chrome/Chromium executable.');
  process.exit(1);
}

mkdirSync(OUT, { recursive: true });
const services = await load<ServiceMeta[]>(path.join(CONTENT, 'services', 'services.ts'), 'serviceMeta');
const projects: Project[] = [];
for (const d of readdirSync(path.join(CONTENT, 'projects'))) {
  const f = path.join(CONTENT, 'projects', d, 'project.ts');
  if (statSync(path.join(CONTENT, 'projects', d)).isDirectory() && existsSync(f)) {
    const p = await load<Project>(f);
    if (!p.hidden) projects.push(p);
  }
}
const chip = (slug: string) => {
  const s = services.find((x) => x.slug === slug);
  return s ? { label: s.shortName, color: CATEGORY_COLOR[s.category] ?? '#94A3B8' } : null;
};

const cards = [
  {
    file: 'default.png',
    html: card({
      eyebrow: 'Pick a project. Click anything.',
      title: 'See how real apps are built on AWS',
      subtitle: 'Explore real serverless projects box by box, watch requests flow, then build them yourself.',
      chips: ['lambda', 's3', 'dynamodb', 'api-gateway', 'cloudfront', 'iam'].map(chip).filter((c): c is NonNullable<typeof c> => !!c),
    }),
  },
  ...projects.map((p) => ({
    file: `${p.slug}.png`,
    html: card({
      eyebrow: `${p.difficulty} project · ${p.estimatedBuildTime}`,
      title: p.title.split(':')[0],
      subtitle: p.tagline.replace(/\s*TODO\(verify\)/g, ''),
      chips: [...new Set(p.services.map((s) => s.serviceSlug))].slice(0, 7).map(chip).filter((c): c is NonNullable<typeof c> => !!c),
    }),
  })),
];

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630 });
for (const c of cards) {
  await page.setContent(c.html, { waitUntil: 'load' });
  await page.screenshot({ path: path.join(OUT, c.file) as `${string}.png` });
  console.log(`public/og/${c.file}`);
}
await browser.close();
