import { useEffect, useState } from 'react';
import { cn } from '@/lib/cn';

export interface SectionLink {
  id: string;
  label: string;
}

/** Sticky in-page navigation that highlights the section in view. */
export function SectionNav({ sections }: { sections: SectionLink[] }) {
  const [active, setActive] = useState(sections[0]?.id);

  // Active = the last section whose top has scrolled above a line just under the sticky bars.
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const line = Math.min(window.innerHeight * 0.35, 220);
      let current = sections[0]?.id;
      for (const s of sections) {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top <= line) current = s.id;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
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
