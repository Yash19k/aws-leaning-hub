import { Fragment, type ReactNode } from 'react';
import { ChevronRight, CircleCheckBig, MousePointerClick, Trash2 } from 'lucide-react';

/** "In the AWS Console" step with a numbered click path. */
export function ConsoleStep({
  path,
  screenshot,
  alt,
  children,
}: {
  /** "Services > IAM > Users > Create user" or an array. */
  path: string | string[];
  screenshot?: string;
  alt?: string;
  children?: ReactNode;
}) {
  const parts = Array.isArray(path) ? path : path.split('>').map((p) => p.trim());
  return (
    <div className="not-prose my-5 overflow-hidden rounded-2xl border border-line bg-surface shadow-soft">
      <div className="flex items-center gap-2 border-b border-line bg-surface-2 px-4 py-2 text-xs font-bold text-muted">
        <MousePointerClick className="h-4 w-4 text-brand-600" aria-hidden="true" />
        In the AWS Console
      </div>
      <div className="px-4 py-4">
        <ol className="flex flex-wrap items-center gap-1.5" aria-label="Click path">
          {parts.map((p, i) => (
            <Fragment key={i}>
              <li className="inline-flex items-center gap-1.5 rounded-lg border border-line bg-surface px-2 py-1 text-sm font-bold text-ink">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-brand-500 text-2xs font-extrabold text-navy-950">
                  {i + 1}
                </span>
                {p}
              </li>
              {i < parts.length - 1 && <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />}
            </Fragment>
          ))}
        </ol>
        {children && <div className="mt-3 text-[0.97rem] leading-relaxed text-ink/85 [&_code]:rounded [&_code]:bg-surface-2 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.875em] [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-2 [&_ul]:list-disc">{children}</div>}
        {screenshot && (
          <img src={screenshot} alt={alt ?? parts.join(' then ')} loading="lazy" className="mt-4 w-full rounded-xl border border-line" />
        )}
      </div>
    </div>
  );
}

/** "You should now see..." box with expected output. */
export function Checkpoint({ title = 'You should now see', output, children }: { title?: string; output?: string; children?: ReactNode }) {
  return (
    <div className="not-prose my-5 rounded-2xl border-2 border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-900/20">
      <p className="flex items-center gap-2 font-bold text-emerald-900 dark:text-emerald-200">
        <CircleCheckBig className="h-5 w-5" aria-hidden="true" />
        {title}
      </p>
      {children && <div className="mt-2 text-[0.97rem] leading-relaxed text-ink/85 [&_code]:rounded [&_code]:bg-surface/80 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.875em] [&_li]:ml-5 [&_ul]:list-disc">{children}</div>}
      {output && (
        <pre className="mt-3 overflow-x-auto rounded-xl bg-[#0B1424] px-4 py-3 font-mono text-xs leading-5 text-[#DCE4F2]">{output.trim()}</pre>
      )}
    </div>
  );
}

/** Red-accented teardown box. Put <Command> blocks inside. */
export function Cleanup({ title = 'Clean up so you are not charged', children }: { title?: string; children: ReactNode }) {
  return (
    <div className="not-prose my-6 rounded-2xl border-2 border-rose-300 bg-rose-50/70 p-4 sm:p-5 dark:border-rose-900 dark:bg-rose-950/30">
      <p className="flex items-center gap-2 text-lg font-bold text-rose-800 dark:text-rose-200">
        <Trash2 className="h-5 w-5" aria-hidden="true" />
        {title}
      </p>
      <div className="mt-2 text-[0.97rem] leading-relaxed text-ink/85 [&_code]:rounded [&_code]:bg-surface/80 [&_code]:px-1 [&_code]:font-mono [&_code]:text-[0.875em] [&_li]:ml-5 [&_ol]:list-decimal [&_p+p]:mt-2 [&_ul]:list-disc">{children}</div>
    </div>
  );
}
