/**
 * A tiny, safe markdown renderer for short text stored in TS data (FAQ answers,
 * what-ifs, troubleshooting fixes). Supports paragraphs, "- " lists, `code`,
 * **bold**, *italic* and [links](/path). No HTML is ever injected.
 */
import { Fragment, type ReactNode } from 'react';
import { Link } from 'react-router-dom';

const INLINE = /(TODO\(verify\)|`[^`]+`|\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[[^\]]+\]\([^)\s]+\))/g;

/** Small pill shown wherever content still says TODO(verify). */
export function VerifyPill() {
  return (
    <span className="todo-verify" title="Not checked yet: a human must confirm this against the AWS console or pricing page before launch.">
      verify
    </span>
  );
}

export function inline(text: string): ReactNode[] {
  const parts = text.split(INLINE);
  return parts.map((part, i) => {
    if (!part) return null;
    if (part === 'TODO(verify)') return <VerifyPill key={i} />;
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code
          key={i}
          className="rounded-md border border-line bg-surface-2 px-1.5 py-0.5 font-mono text-[0.875em] text-navy-700 dark:text-navy-100"
        >
          {part.slice(1, -1)}
        </code>
      );
    }
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-ink">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('*') && part.endsWith('*') && part.length > 2) {
      return <em key={i}>{part.slice(1, -1)}</em>;
    }
    const link = /^\[([^\]]+)\]\(([^)\s]+)\)$/.exec(part);
    if (link) {
      const [, label, href] = link;
      if (href.startsWith('/')) {
        return (
          <Link key={i} to={href} className="text-link">
            {label}
          </Link>
        );
      }
      return (
        <a key={i} href={href} target="_blank" rel="noopener noreferrer" className="text-link">
          {label}
        </a>
      );
    }
    return <Fragment key={i}>{part}</Fragment>;
  });
}

export function Markdown({ text, className }: { text: string; className?: string }) {
  const blocks = text.trim().split(/\n\s*\n/);
  return (
    <div className={className ?? 'space-y-3 leading-relaxed text-ink/90'}>
      {blocks.map((block, i) => {
        const lines = block.split('\n');
        if (lines.every((l) => /^\s*[-*] /.test(l))) {
          return (
            <ul key={i} className="list-disc space-y-1 pl-5 marker:text-brand-500">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*[-*] /, ''))}</li>
              ))}
            </ul>
          );
        }
        if (lines.every((l) => /^\s*\d+\. /.test(l))) {
          return (
            <ol key={i} className="list-decimal space-y-1 pl-5 marker:font-bold marker:text-brand-600">
              {lines.map((l, j) => (
                <li key={j}>{inline(l.replace(/^\s*\d+\. /, ''))}</li>
              ))}
            </ol>
          );
        }
        return <p key={i}>{inline(lines.join(' '))}</p>;
      })}
    </div>
  );
}

/** Strip markdown-lite to plain text (for search and meta descriptions). */
export function plain(text: string): string {
  return text
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/[`*]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
