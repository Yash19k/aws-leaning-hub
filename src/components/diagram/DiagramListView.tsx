import { ArrowRight, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/cn';
import { Icon } from '@/lib/icons';
import { nodeVisuals } from './ArchNodeView';
import { useDiagram } from './DiagramContext';

/** Accessible list alternative to the canvas: every box and what it talks to. */
export function DiagramListView({ className }: { className?: string }) {
  const d = useDiagram();
  const { nodes, edges } = d.source.architecture;

  return (
    <ul className={cn('grid gap-2 p-3 sm:grid-cols-2 sm:p-4', className)}>
      {nodes.map((n) => {
        const { service, color, icon } = nodeVisuals(n);
        const out = edges.filter((e) => e.source === n.id);
        const active = d.activeNodeIds.has(n.id);
        const highlighted = d.highlight?.ids.includes(n.id);
        return (
          <li key={n.id}>
            <button
              type="button"
              onClick={() => d.openNode(n.id)}
              className={cn(
                'flex w-full items-start gap-3 rounded-2xl border-2 bg-surface p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-lift',
                active ? 'border-brand-500 shadow-glow' : highlighted ? 'border-teal-500 shadow-glow-teal' : 'border-line',
              )}
            >
              <span
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-white"
                style={{ backgroundColor: color }}
              >
                <Icon name={icon} className="h-5 w-5" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-bold text-ink">
                  {n.label}
                  <ChevronRight className="h-4 w-4 text-muted" aria-hidden="true" />
                </span>
                <span className="block font-mono text-2xs text-muted">{n.sublabel ?? service?.name ?? n.kind}</span>
                {out.length > 0 && (
                  <span className="mt-2 block space-y-1">
                    {out.map((e) => (
                      <span key={e.id} className="flex items-center gap-1.5 text-xs text-ink/80">
                        <ArrowRight className="h-3 w-3 shrink-0 text-brand-600" aria-hidden="true" />
                        <span className="truncate">
                          <span className="font-semibold">{d.nodesById.get(e.target)?.label}</span>
                          <span className="text-muted"> · {e.label}</span>
                        </span>
                      </span>
                    ))}
                  </span>
                )}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
