import { useMemo } from 'react';
import { ACTOR_COLOR, CATEGORIES } from '@/lib/categories';
import { getService } from '@/lib/content';
import { useReducedMotion } from '@/lib/hooks';
import type { Architecture } from '@/lib/types';

/** Small decorative SVG of a project's architecture with dots travelling along the lines. */
export function MiniDiagram({
  architecture,
  className,
  animate = true,
  maxDots = 5,
}: {
  architecture: Architecture;
  className?: string;
  animate?: boolean;
  maxDots?: number;
}) {
  const reduced = useReducedMotion();
  const W = 176;
  const H = 64;

  const { nodes, edges, viewBox } = useMemo(() => {
    const xs = architecture.nodes.map((n) => n.position.x);
    const ys = architecture.nodes.map((n) => n.position.y);
    const minX = Math.min(...xs);
    const minY = Math.min(...ys);
    const pad = 30;
    const w = Math.max(...xs) - minX + W + pad * 2;
    const h = Math.max(...ys) - minY + H + pad * 2;
    const pos = new Map(architecture.nodes.map((n) => [n.id, { x: n.position.x - minX + pad, y: n.position.y - minY + pad }]));
    const nodes = architecture.nodes.map((n) => {
      const s = n.serviceSlug ? getService(n.serviceSlug) : undefined;
      return { id: n.id, ...pos.get(n.id)!, color: s ? CATEGORIES[s.category].color : ACTOR_COLOR, actor: n.kind !== 'service' };
    });
    const edges = architecture.edges
      .map((e) => {
        const a = pos.get(e.source);
        const b = pos.get(e.target);
        if (!a || !b) return null;
        return { id: e.id, d: `M${a.x + W / 2},${a.y + H / 2} L${b.x + W / 2},${b.y + H / 2}`, dashed: e.style === 'dashed' };
      })
      .filter((e): e is NonNullable<typeof e> => !!e);
    return { nodes, edges, viewBox: `0 0 ${w} ${h}` };
  }, [architecture]);

  const dotEdges = edges.filter((e) => !e.dashed).slice(0, maxDots);

  return (
    <svg viewBox={viewBox} className={className} aria-hidden="true" preserveAspectRatio="xMidYMid meet">
      {edges.map((e) => (
        <path key={e.id} d={e.d} stroke="currentColor" strokeOpacity={0.25} strokeWidth={5} strokeDasharray={e.dashed ? '12 12' : undefined} fill="none" />
      ))}
      {nodes.map((n) => (
        <g key={n.id}>
          <rect
            x={n.x}
            y={n.y}
            width={W}
            height={H}
            rx={18}
            fill={`${n.color}22`}
            stroke={n.color}
            strokeWidth={4}
            strokeDasharray={n.actor ? '10 8' : undefined}
          />
          <rect x={n.x + 12} y={n.y + 12} width={40} height={40} rx={11} fill={n.color} />
          <rect x={n.x + 64} y={n.y + 20} width={86} height={9} rx={4.5} fill="currentColor" fillOpacity={0.35} />
          <rect x={n.x + 64} y={n.y + 36} width={56} height={7} rx={3.5} fill="currentColor" fillOpacity={0.18} />
        </g>
      ))}
      {animate &&
        !reduced &&
        dotEdges.map((e, i) => (
          <circle key={e.id} r={10} fill="#FF9900" stroke="#fff" strokeWidth={3}>
            <animateMotion dur={`${2.4 + (i % 3) * 0.5}s`} begin={`${i * 0.6}s`} repeatCount="indefinite" path={e.d} />
          </circle>
        ))}
    </svg>
  );
}
