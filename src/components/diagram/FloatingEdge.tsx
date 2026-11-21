import { memo } from 'react';
import { BaseEdge, EdgeLabelRenderer, useInternalNode, type Edge, type EdgeProps } from '@xyflow/react';
import { cn } from '@/lib/cn';
import type { ArchEdge } from '@/lib/types';
import { useDiagram, useTravelProgress } from './DiagramContext';
import { borderPoint, easeInOut } from './layout';

export type ArchFlowEdge = Edge<{ arch: ArchEdge }, 'floating'>;

const COLORS = {
  idle: 'rgb(var(--text) / 0.28)',
  hover: 'rgb(var(--text) / 0.7)',
  active: '#FF9900',
  trail: 'rgba(255, 153, 0, 0.45)',
  highlight: '#14B09F',
};

function FloatingEdgeInner({ id, source, target, data }: EdgeProps<ArchFlowEdge>) {
  const s = useInternalNode(source);
  const t = useInternalNode(target);
  const d = useDiagram();
  const isActive = d.activeEdgeId === id;
  const progress = useTravelProgress(d.travel, isActive);

  if (!s || !t || !data) return null;
  const rect = (n: typeof s) => ({
    x: n.internals.positionAbsolute.x,
    y: n.internals.positionAbsolute.y,
    w: n.measured.width ?? 176,
    h: n.measured.height ?? 64,
  });
  const a = borderPoint(rect(s), rect(t));
  const b = borderPoint(rect(t), rect(s));
  const path = `M ${a.x},${a.y} L ${b.x},${b.y}`;
  const mx = (a.x + b.x) / 2;
  const my = (a.y + b.y) / 2;
  const angle = Math.atan2(b.y - a.y, b.x - a.x);

  const flowOn = !!d.currentFlow;
  const isTrail = d.trailEdgeIds.has(id);
  const inFlow = d.flowEdgeIds.has(id);
  const hl = d.highlight?.ids;
  const isHighlighted = !flowOn && !!hl && hl.includes(source) && hl.includes(target);
  const touchesHover = d.hoveredNodeId === source || d.hoveredNodeId === target || d.hoveredEdgeId === id;
  const dashed = data.arch.style === 'dashed';

  let stroke = COLORS.idle;
  let width = 2;
  let opacity = 1;
  if (isActive) {
    stroke = COLORS.active;
    width = 3.5;
  } else if (isTrail) {
    stroke = COLORS.trail;
    width = 3;
  } else if (isHighlighted) {
    stroke = COLORS.highlight;
    width = 3;
  } else if (touchesHover) {
    stroke = COLORS.hover;
    width = 2.5;
  }
  if ((flowOn && !inFlow) || (!flowOn && hl && !isHighlighted)) opacity = 0.25;

  const showLabel =
    isActive || touchesHover || d.tappedEdgeId === id || d.showAllLabels || (isHighlighted && !!hl);

  // Arrowhead at the target end.
  const ah = 9;
  const arrow = [
    [b.x, b.y],
    [b.x - ah * Math.cos(angle - 0.42), b.y - ah * Math.sin(angle - 0.42)],
    [b.x - ah * Math.cos(angle + 0.42), b.y - ah * Math.sin(angle + 0.42)],
  ]
    .map((p) => p.join(','))
    .join(' ');

  // Travelling dot.
  let dot: { x: number; y: number } | null = null;
  if (isActive) {
    const p = easeInOut(progress);
    const from = d.activeReverse ? b : a;
    const to = d.activeReverse ? a : b;
    dot = { x: from.x + (to.x - from.x) * p, y: from.y + (to.y - from.y) * p };
  }

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        interactionWidth={26}
        style={{
          stroke,
          strokeWidth: width,
          opacity,
          strokeDasharray: dashed ? '6 6' : undefined,
          strokeLinecap: 'round',
        }}
      />
      <polygon points={arrow} fill={stroke} opacity={opacity} style={{ transition: 'fill 0.2s, opacity 0.2s' }} />
      {dot && (
        <g pointerEvents="none">
          <circle cx={dot.x} cy={dot.y} r={13} fill="#FF9900" opacity={0.18} />
          <circle cx={dot.x} cy={dot.y} r={7.5} fill="#FF9900" stroke="#fff" strokeWidth={2.5} />
        </g>
      )}
      <EdgeLabelRenderer>
        <div
          className={cn(
            'pointer-events-none absolute z-20 max-w-[200px] rounded-lg border px-2 py-1 text-center font-mono text-[0.66rem] font-semibold leading-tight shadow-soft transition-opacity duration-150',
            isActive
              ? 'border-brand-400 bg-brand-50 text-brand-800 dark:bg-navy-900 dark:text-brand-200'
              : 'border-line bg-surface text-ink',
            showLabel ? 'opacity-100' : 'opacity-0',
          )}
          style={{ transform: `translate(-50%, -50%) translate(${mx}px, ${my}px)` }}
          aria-hidden={!showLabel}
        >
          {data.arch.label}
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export const FloatingEdge = memo(FloatingEdgeInner);
