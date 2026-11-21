import { useId, useState, type ReactNode } from 'react';
import { CheckCircle2, CircleSlash } from 'lucide-react';
import { AccordionItem } from '@/components/ui/Accordion';
import { cn } from '@/lib/cn';
import { inline } from '@/lib/markdown';

/** Project FAQ entry: <FaqItem q="Question">Answer in markdown</FaqItem>. Wrap several in <FaqList>. */
export function FaqItem({ q, children }: { q: string; children: ReactNode }) {
  return (
    <AccordionItem title={q}>
      <div className="space-y-2 [&_a]:text-link [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.875em] [&_li]:ml-5 [&_ol]:list-decimal [&_ul]:list-disc">
        {children}
      </div>
    </AccordionItem>
  );
}

export function FaqList({ children }: { children: ReactNode }) {
  return <div className="not-prose card-base my-4 px-5 sm:px-6">{children}</div>;
}

/** Grid of concept cards for service pages. */
export function KeyConcepts({ children }: { children: ReactNode }) {
  return <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">{children}</div>;
}

export function Concept({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-2xl border border-line bg-surface p-4 shadow-soft transition-transform hover:-translate-y-0.5">
      <p className="font-bold text-ink">{title}</p>
      <div className="mt-1 text-[0.95rem] leading-relaxed text-ink/80 [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.875em]">
        {children}
      </div>
    </div>
  );
}

/** "When to use it / when not to" two-column cards. */
export function WhenToUse({ use, avoid }: { use: string[]; avoid: string[] }) {
  return (
    <div className="not-prose my-6 grid gap-3 sm:grid-cols-2">
      <div className="rounded-2xl border-2 border-emerald-300 bg-emerald-50/60 p-4 dark:border-emerald-800 dark:bg-emerald-900/15">
        <p className="mb-2 flex items-center gap-2 font-bold text-emerald-800 dark:text-emerald-200">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" /> Great for
        </p>
        <ul className="!list-none !space-y-1.5 !pl-0 text-[0.95rem] text-ink/85">
          {use.map((u) => (
            <li key={u} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden="true" />
              <span>{inline(u)}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="rounded-2xl border-2 border-line bg-surface p-4">
        <p className="mb-2 flex items-center gap-2 font-bold text-muted">
          <CircleSlash className="h-5 w-5" aria-hidden="true" /> Reach for something else when
        </p>
        <ul className="!list-none !space-y-1.5 !pl-0 text-[0.95rem] text-ink/85">
          {avoid.map((u) => (
            <li key={u} className="flex gap-2">
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-slate-400" aria-hidden="true" />
              <span>{inline(u)}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

/** A jargon word with a tap/hover definition: <Term t="presigned URL">A temporary link...</Term> */
export function Term({ t, children }: { t: string; children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const id = useId();
  return (
    <span className="relative inline" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        type="button"
        className="cursor-help font-semibold text-ink underline decoration-teal-500 decoration-dotted decoration-2 underline-offset-4"
        aria-expanded={open}
        aria-describedby={id}
        onClick={() => setOpen((o) => !o)}
        onFocus={() => setOpen(true)}
        onBlur={() => setOpen(false)}
        onKeyDown={(e) => e.key === 'Escape' && setOpen(false)}
      >
        {t}
      </button>
      <span
        id={id}
        role="tooltip"
        className={cn(
          'absolute bottom-full left-1/2 z-40 mb-2 w-64 -translate-x-1/2 rounded-xl bg-navy-900 p-3 text-left text-sm font-normal leading-snug text-white shadow-lift transition-all dark:bg-navy-100 dark:text-navy-950',
          open ? 'visible opacity-100' : 'invisible translate-y-1 opacity-0',
        )}
      >
        <span className="mb-0.5 block text-2xs font-bold uppercase tracking-wider text-teal-300 dark:text-teal-700">{t}</span>
        {children}
      </span>
    </span>
  );
}
