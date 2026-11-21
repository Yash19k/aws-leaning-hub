import { isValidElement, type ComponentProps, type ReactElement, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { MDXComponents } from 'mdx/types';
import { ServiceChip } from '@/components/ui/Badge';
import { Callout } from '@/components/ui/Callout';
import { CodeBlock, parseLineRanges } from '@/components/ui/CodeBlock';
import { Checkpoint, Cleanup, ConsoleStep } from './Boxes';
import { Command } from './Command';
import { Concept, FaqItem, FaqList, KeyConcepts, Term, WhenToUse } from './Extras';
import { Prerequisite } from './Prerequisite';
import { Quiz } from './Quiz';
import { Step } from './Step';

/** ```lang title="file.py" {2-4}  ->  CodeBlock */
function Pre({ children }: { children?: ReactNode }) {
  if (isValidElement(children)) {
    const el = children as ReactElement<{ className?: string; children?: ReactNode; metastring?: string }>;
    const lang = /language-(\S+)/.exec(el.props.className ?? '')?.[1];
    const meta = el.props.metastring ?? '';
    const title = /title="([^"]+)"/.exec(meta)?.[1];
    const lines = /\{([\d,\s-]+)\}/.exec(meta)?.[1];
    const code = typeof el.props.children === 'string' ? el.props.children : String(el.props.children ?? '');
    return <CodeBlock code={code} language={lang} filename={title} highlightLines={parseLineRanges(lines)} />;
  }
  return <pre>{children}</pre>;
}

function A({ href = '', children, ...rest }: ComponentProps<'a'>) {
  if (href.startsWith('/')) {
    return (
      <Link to={href} {...rest}>
        {children}
      </Link>
    );
  }
  if (href.startsWith('#')) return <a href={href} {...rest}>{children}</a>;
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...rest}>
      {children}
    </a>
  );
}

function Img(props: ComponentProps<'img'>) {
  return <img loading="lazy" decoding="async" {...props} alt={props.alt ?? ''} />;
}

export const mdxComponents: MDXComponents = {
  pre: Pre,
  a: A,
  img: Img,
  Step,
  Prerequisite,
  Command,
  ConsoleStep,
  Checkpoint,
  Cleanup,
  Callout,
  Quiz,
  FaqItem,
  FaqList,
  KeyConcepts,
  Concept,
  WhenToUse,
  Term,
  CodeBlock,
  ServiceChip,
};
