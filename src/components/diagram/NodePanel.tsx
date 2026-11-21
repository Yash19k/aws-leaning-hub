import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Code2, GitCompareArrows, Lightbulb, Play, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Sheet } from '@/components/ui/Sheet';
import { CATEGORIES } from '@/lib/categories';
import { Icon } from '@/lib/icons';
import { inline } from '@/lib/markdown';
import { nodeVisuals } from './ArchNodeView';
import { useDiagram } from './DiagramContext';

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-line bg-surface-2/50 p-4">
      <h3 className="mb-1.5 flex items-center gap-2 text-sm font-bold text-ink">
        <span className="text-brand-600 dark:text-brand-400">{icon}</span>
        {title}
      </h3>
      <div className="text-[0.95rem] leading-relaxed text-ink/85">{children}</div>
    </section>
  );
}

/** Side panel (bottom sheet on phones) for the clicked diagram node. */
export function NodePanel() {
  const d = useDiagram();
  const node = d.selectedNodeId ? d.nodesById.get(d.selectedNodeId) : undefined;
  const visuals = node ? nodeVisuals(node) : undefined;
  const service = visuals?.service;
  const role = node?.serviceSlug ? d.source.services.find((s) => s.serviceSlug === node.serviceSlug) : undefined;
  const peeks = node ? d.source.codePeeks.filter((p) => p.nodeId === node.id) : [];
  const flows = node
    ? d.source.flows.filter((f) =>
        f.steps.some((st) => {
          if (st.nodeId === node.id) return true;
          const e = st.edgeId ? d.edgesById.get(st.edgeId) : undefined;
          return e && (e.source === node.id || e.target === node.id);
        }),
      )
    : [];

  const scrollToDiagram = () => {
    document.getElementById('architecture')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <Sheet
      open={!!node}
      onClose={d.closeNode}
      title={node?.label ?? ''}
      eyebrow={
        node &&
        visuals && (
          <div className="flex items-center gap-2">
            <span
              className="flex h-7 w-7 items-center justify-center rounded-lg text-white"
              style={{ backgroundColor: visuals.color }}
            >
              <Icon name={visuals.icon} className="h-4 w-4" />
            </span>
            <span className="text-xs font-bold text-muted">{service ? service.name : node.kind === 'external' ? 'Outside AWS' : 'Person or device'}</span>
            {service && (
              <Badge className="ml-auto" tone="neutral">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORIES[service.category].color }} />
                {CATEGORIES[service.category].label}
              </Badge>
            )}
          </div>
        )
      }
      footer={
        service && (
          <Link
            to={`/services/${service.slug}`}
            onClick={d.closeNode}
            className="flex items-center justify-between rounded-xl bg-surface-2 px-4 py-3 font-bold text-ink transition-colors hover:bg-brand-100 dark:hover:bg-brand-900/30"
          >
            <span className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-brand-600" aria-hidden="true" />
              Learn more about {service.shortName}
            </span>
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        )
      }
    >
      {node && (
        <div className="space-y-3">
          <Section icon={<Sparkles className="h-4 w-4" />} title="What it does here">
            <p>{inline(node.description ?? role?.roleInThisProject ?? service?.oneLiner ?? '')}</p>
          </Section>

          {(role?.analogy || (!role && service)) && (
            <Section icon={<Lightbulb className="h-4 w-4" />} title="Think of it like">
              <p>{inline(role?.analogy ?? service?.analogy ?? '')}</p>
            </Section>
          )}

          {role?.whyNotAlternative && (
            <Section icon={<GitCompareArrows className="h-4 w-4" />} title="Why not something else?">
              <p>{inline(role.whyNotAlternative)}</p>
            </Section>
          )}

          {peeks.length > 0 && (
            <div className="space-y-2 pt-1">
              {peeks.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    d.closeNode();
                    d.openPeek(p.id);
                  }}
                  className="flex w-full items-center gap-3 rounded-2xl border-2 border-navy-800 bg-[#0B1424] px-4 py-3 text-left text-white transition-transform hover:-translate-y-0.5"
                >
                  <Code2 className="h-5 w-5 shrink-0 text-brand-400" aria-hidden="true" />
                  <span className="min-w-0 flex-1">
                    <span className="block font-bold">Peek at the code</span>
                    <span className="block truncate font-mono text-2xs text-white/60">{p.title}</span>
                  </span>
                  <ArrowRight className="h-4 w-4 shrink-0" aria-hidden="true" />
                </button>
              ))}
            </div>
          )}

          {flows.length > 0 && (
            <div className="pt-2">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted">Watch it in action</p>
              <div className="flex flex-wrap gap-2">
                {flows.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      d.closeNode();
                      d.selectFlow(f.id);
                      scrollToDiagram();
                    }}
                    className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-surface px-3 py-2 text-sm font-bold text-ink transition-colors hover:border-brand-400"
                  >
                    <Play className="h-3.5 w-3.5 text-brand-600" aria-hidden="true" />
                    {f.title}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </Sheet>
  );
}
