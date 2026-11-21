import { Highlight, themes, type PrismTheme } from 'prism-react-renderer';
import { FileCode2 } from 'lucide-react';
import { cn } from '@/lib/cn';
import { LANGUAGE_LABEL, normalizeLanguage } from '@/lib/prism';
import { CopyButton } from './CopyButton';

/** Code is always shown on deep navy, in both themes, for consistent contrast. */
const hubTheme: PrismTheme = {
  ...themes.nightOwl,
  plain: { ...themes.nightOwl.plain, backgroundColor: '#0B1424', color: '#DCE4F2' },
};

export interface CodeBlockProps {
  code: string;
  language?: string;
  filename?: string;
  /** 1-based lines to highlight. */
  highlightLines?: number[];
  showLineNumbers?: boolean;
  className?: string;
  maxHeight?: number;
  /** Hide the header bar (for tiny payload bubbles). */
  bare?: boolean;
}

/** Parses "{1,3-5}" into [1,3,4,5]. */
export function parseLineRanges(spec: string | undefined): number[] {
  if (!spec) return [];
  const out: number[] = [];
  spec
    .replace(/[{}\s]/g, '')
    .split(',')
    .filter(Boolean)
    .forEach((part) => {
      const [a, b] = part.split('-').map(Number);
      if (Number.isFinite(a)) {
        for (let n = a; n <= (Number.isFinite(b) ? b : a); n++) out.push(n);
      }
    });
  return out;
}

export function CodeBlock({
  code,
  language,
  filename,
  highlightLines = [],
  showLineNumbers,
  className,
  maxHeight,
  bare,
}: CodeBlockProps) {
  const lang = normalizeLanguage(language);
  const text = code.replace(/\n$/, '');
  const lines = text.split('\n').length;
  const numbers = showLineNumbers ?? lines > 4;
  const hl = new Set(highlightLines);

  return (
    <div
      className={cn(
        'not-prose group my-5 overflow-hidden rounded-2xl border border-navy-800 bg-[#0B1424] text-left shadow-soft',
        className,
      )}
    >
      {!bare && (
        <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-white/[0.03] px-4 py-2">
          <div className="flex min-w-0 items-center gap-2 text-xs font-semibold text-white/70">
            <FileCode2 className="h-4 w-4 shrink-0 text-brand-400" aria-hidden="true" />
            <span className="truncate font-mono">{filename ?? LANGUAGE_LABEL[lang] ?? lang}</span>
            {filename && (
              <span className="hidden rounded bg-white/10 px-1.5 py-0.5 text-2xs uppercase tracking-wide text-white/60 sm:inline">
                {LANGUAGE_LABEL[lang] ?? lang}
              </span>
            )}
          </div>
          <CopyButton text={text} />
        </div>
      )}
      <Highlight theme={hubTheme} code={text} language={lang}>
        {({ className: cls, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={cn(cls, 'overflow-x-auto py-3 font-mono text-[0.8125rem] leading-6 sm:text-sm')}
            style={{ ...style, maxHeight, background: 'transparent' }}
            tabIndex={0}
          >
            {tokens.map((line, i) => {
              const n = i + 1;
              const lineProps = getLineProps({ line });
              return (
                <div
                  key={i}
                  {...lineProps}
                  className={cn(
                    lineProps.className,
                    'flex min-w-fit px-4',
                    hl.has(n) && 'border-l-[3px] border-brand-500 bg-brand-500/10 pl-[13px]',
                  )}
                >
                  {numbers && (
                    <span className="mr-4 inline-block w-6 shrink-0 select-none text-right text-white/25" aria-hidden="true">
                      {n}
                    </span>
                  )}
                  <span className="whitespace-pre">
                    {line.map((token, key) => (
                      <span key={key} {...getTokenProps({ token })} />
                    ))}
                  </span>
                </div>
              );
            })}
          </pre>
        )}
      </Highlight>
    </div>
  );
}
