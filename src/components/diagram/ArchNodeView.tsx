import { memo } from 'react';
import { Handle, Position, type NodeProps, type Node } from '@xyflow/react';
import { ACTOR_COLOR, CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/cn';
import { getService } from '@/lib/content';
import { Icon } from '@/lib/icons';
import type { ArchNode, IconName } from '@/lib/types';
import { useDiagram } from './DiagramContext';
import { NODE_SIZE, type LayoutMode } from './layout';

export type ArchFlowNode = Node<{ arch: ArchNode; mode: LayoutMode }, 'arch'>;

const ACTOR_ICONS: Record<string, IconName> = { user: 'user', browser: 'monitor', external: 'globe' };

export function nodeVisuals(arch: ArchNode) {
  const service = arch.serviceSlug ? getService(arch.serviceSlug) : undefined;
  const color = service ? CATEGORIES[service.category].color : ACTOR_COLOR;
  const icon: IconName = arch.icon ?? service?.icon ?? ACTOR_ICONS[arch.kind] ?? 'box';
  return { service, color, icon };
}

function ArchNodeViewInner({ data }: NodeProps<ArchFlowNode>) {
  const { arch, mode } = data;
  const d = useDiagram();
  const { service, color, icon } = nodeVisuals(arch);
  const size = NODE_SIZE[mode];

  const isActive = d.activeNodeIds.has(arch.id);
  const isSelected = d.selectedNodeId === arch.id;
  const isHighlighted = !!d.highlight?.ids.includes(arch.id);
  const isHovered = d.hoveredNodeId === arch.id;
  const flowOn = !!d.currentFlow;
  const dimmed =
    (flowOn && !d.flowNodeIds.has(arch.id)) || (!!d.highlight && !isHighlighted && !flowOn);
  const isActor = arch.kind !== 'service';

  return (
    // React Flow sets pointer-events:none on non-selectable nodes; the button must opt back in.
    <div style={{ width: size.w, height: size.h, pointerEvents: 'all' }} className="relative">
      <Handle type="target" position={Position.Top} isConnectable={false} />
      <Handle type="source" position={Position.Bottom} isConnectable={false} />
      <button
        type="button"
        onClick={() => d.openNode(arch.id)}
        onMouseEnter={() => d.setHoveredNodeId(arch.id)}
        onMouseLeave={() => d.setHoveredNodeId(null)}
        onFocus={() => d.setHoveredNodeId(arch.id)}
        onBlur={() => d.setHoveredNodeId(null)}
        aria-label={`${arch.label}${service ? `, ${service.name}` : ''}. Open details`}
        className={cn(
          'nodrag nopan group flex h-full w-full items-center gap-2.5 rounded-2xl border-2 bg-surface px-2.5 text-left transition-all duration-200',
          isActor && 'border-dashed',
          'hover:-translate-y-0.5 hover:shadow-lift',
          isSelected && 'ring-4 ring-brand-400/50',
          isActive && 'z-10 scale-[1.06] shadow-glow',
          isHighlighted && !flowOn && 'shadow-glow-teal',
          dimmed && 'opacity-40',
          !isActive && !isHighlighted && 'shadow-soft',
        )}
        style={{
          borderColor: isActive ? '#FF9900' : isHighlighted && !flowOn ? '#14B09F' : isHovered ? color : `${color}66`,
        }}
      >
        <span
          className={cn(
            'flex shrink-0 items-center justify-center rounded-xl text-white transition-transform group-hover:scale-105',
            mode === 'mobile' ? 'h-9 w-9' : 'h-10 w-10',
            isActive && 'animate-pulse-ring',
          )}
          style={{ backgroundColor: color }}
        >
          <Icon name={icon} className={mode === 'mobile' ? 'h-[18px] w-[18px]' : 'h-5 w-5'} />
        </span>
        <span className="min-w-0 flex-1">
          <span
            className={cn(
              'line-clamp-2 break-words font-bold leading-[1.15] text-ink',
              mode === 'mobile' ? 'text-[0.76rem]' : 'text-[0.82rem]',
            )}
          >
            {arch.label}
          </span>
          {(arch.sublabel || service) && (
            <span className="mt-0.5 block truncate font-mono text-[0.66rem] leading-tight text-muted">
              {arch.sublabel ?? service?.shortName}
            </span>
          )}
        </span>
      </button>
    </div>
  );
}

export const ArchNodeView = memo(ArchNodeViewInner);
