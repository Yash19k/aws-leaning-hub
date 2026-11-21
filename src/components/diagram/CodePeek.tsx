import { ExternalLink } from 'lucide-react';
import { CodeBlock } from '@/components/ui/CodeBlock';
import { Sheet } from '@/components/ui/Sheet';
import { Markdown } from '@/lib/markdown';
import { useDiagram } from './DiagramContext';

/** Dialog that shows a real code snippet with a plain-language explanation. */
export function CodePeek() {
  const d = useDiagram();
  const peek = d.source.codePeeks.find((p) => p.id === d.peekId);
  const node = peek ? d.nodesById.get(peek.nodeId) : undefined;
  const githubHref =
    peek && d.source.githubUrl ? `${d.source.githubUrl}/blob/${d.source.githubBranch ?? 'main'}/${peek.filePath}` : undefined;

  return (
    <Sheet
      open={!!peek}
      onClose={d.closePeek}
      side="center"
      widthClass="max-w-3xl"
      title={peek?.title ?? ''}
      eyebrow={node && <span className="eyebrow">Peek at the code · {node.label}</span>}
      footer={
        githubHref && (
          <a href={githubHref} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-sm font-bold text-link">
            Open the full file on GitHub <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
          </a>
        )
      }
    >
      {peek && (
        <div>
          <Markdown text={peek.explanation} />
          <CodeBlock code={peek.code} language={peek.language} filename={peek.filePath} highlightLines={peek.highlightLines} showLineNumbers />
          {peek.highlightLines && peek.highlightLines.length > 0 && (
            <p className="text-xs text-muted">Highlighted lines are the interesting part.</p>
          )}
        </div>
      )}
    </Sheet>
  );
}
