/**
 * Content loader. Projects are discovered automatically from src/content/projects/<slug>/project.ts;
 * MDX bodies are code-split and loaded on demand.
 */
import { lazy, type ComponentType, type LazyExoticComponent } from 'react';
import type { MDXProps } from 'mdx/types';
import { comingSoon } from '@/content/coming-soon';
import { faqItems } from '@/content/faq/faq';
import { setupGuides } from '@/content/setup/guides';
import { serviceMeta } from '@/content/services/services';
import { troubleshootingItems } from '@/content/troubleshooting/troubleshooting';
import type { Project, Service } from './types';

const projectModules = import.meta.glob<{ default: Project }>('../content/projects/*/project.ts', {
  eager: true,
});

export const allProjects: Project[] = Object.values(projectModules)
  .map((m) => m.default)
  .sort((a, b) => a.order - b.order);

/** Projects shown in the gallery, search and navigation. */
export const projects: Project[] = allProjects.filter((p) => !p.hidden);

export function getProject(slug: string | undefined): Project | undefined {
  return allProjects.find((p) => p.slug === slug);
}

export function nextProject(slug: string): Project | undefined {
  const i = projects.findIndex((p) => p.slug === slug);
  return i >= 0 ? projects[i + 1] : undefined;
}

// ---------------------------------------------------------------- services

export const services: Service[] = serviceMeta.map((s) => ({
  ...s,
  usedInProjects: projects.filter((p) => p.services.some((r) => r.serviceSlug === s.slug)).map((p) => p.slug),
}));

export function getService(slug: string | undefined): Service | undefined {
  return services.find((s) => s.slug === slug);
}

// ---------------------------------------------------------------- setup guides

export const guides = [...setupGuides].sort((a, b) => a.order - b.order);

export function getGuide(slug: string | undefined) {
  return guides.find((g) => g.slug === slug);
}

export { comingSoon, faqItems, troubleshootingItems };

// ---------------------------------------------------------------- MDX

type MdxModule = { default: ComponentType<MDXProps> };
const mdxLoaders = import.meta.glob<MdxModule>('../content/**/*.mdx');
const lazyCache = new Map<string, LazyExoticComponent<ComponentType<MDXProps>>>();

function lazyMdx(path: string) {
  const loader = mdxLoaders[path];
  if (!loader) return undefined;
  let comp = lazyCache.get(path);
  if (!comp) {
    comp = lazy(loader);
    lazyCache.set(path, comp);
  }
  return comp;
}

export function projectMdx(slug: string, name: 'overview' | 'build' | 'faq') {
  return lazyMdx(`../content/projects/${slug}/${name}.mdx`);
}

export function serviceMdx(slug: string) {
  return lazyMdx(`../content/services/${slug}.mdx`);
}

export function setupMdx(slug: string) {
  return lazyMdx(`../content/setup/${slug}.mdx`);
}

/** Raw MDX source, used to build the search index lazily. */
export const rawMdxLoaders = import.meta.glob<string>('../content/**/*.mdx', {
  query: '?raw',
  import: 'default',
});
