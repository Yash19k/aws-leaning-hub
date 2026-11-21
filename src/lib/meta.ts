import { useEffect } from 'react';
import { SITE } from './site';

function setMeta(selector: string, attr: 'name' | 'property', key: string, content: string) {
  let el = document.head.querySelector<HTMLMetaElement>(selector);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** Per-page <title>, description and Open Graph tags. */
export function usePageMeta(title: string | undefined, description?: string, image?: string) {
  useEffect(() => {
    const full = title ? `${title} · ${SITE.name}` : `${SITE.name} · See how real apps are built on AWS`;
    document.title = full;
    const desc = description ?? SITE.description;
    setMeta('meta[name="description"]', 'name', 'description', desc);
    setMeta('meta[property="og:title"]', 'property', 'og:title', full);
    setMeta('meta[property="og:description"]', 'property', 'og:description', desc);
    setMeta('meta[property="og:image"]', 'property', 'og:image', image ?? '/og/default.png');
  }, [title, description, image]);
}
