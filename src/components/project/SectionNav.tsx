import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export interface SectionLink {
  id: string;
  label: string;
}

/** Sticky in-page navigation that highlights the section in view. */
export function SectionNav({ sections }: { sections: SectionLink[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  useEffect(() => {
    const els = sections.map((s) => document.getElementById(s.id)).filter((e): e is HTMLElement => !!e);
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: '-120px 0px -60% 0px' },
    );
    els.forEach((e) => io.observe(e));
    return () => io.disconnect();
  }, [sections]);

  useEffect(() => {
    document.getElementById(`secnav-${active}`)?.scrollIntoView({ block: 'nearest', inline: 'center' });
  }, [active]);

  return (
    <nav aria-label="On this page" className="-mx-4 border-b border-line bg-bg/90 px-4 backdrop-blur-lg sm:mx-0 sm:rounded-2xl sm:border sm:px-2">
      <ul className="no-scrollbar flex gap-1 overflow-x-auto py-2">
        {sections.map((s) => (
          <li key={s.id}>
            <a
              id={`secnav-${s.id}`}
              href={`#${s.id}`}
              onClick={(e) => {
                e.preventDefault();
                document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                history.replaceState(null, '', `#${s.id}`);
              }}
              className={cn(
                'block whitespace-nowrap rounded-xl px-3 py-1.5 text-sm font-bold transition-colors',
                active === s.id ? 'bg-brand-500 text-navy-950' : 'text-muted hover:bg-surface-2 hover:text-ink',
              )}
              aria-current={active === s.id ? 'true' : undefined}
            >
              {s.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
