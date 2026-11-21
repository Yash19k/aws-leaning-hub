import '@xyflow/react/dist/base.css';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ReactFlow, ReactFlowProvider, useReactFlow, type EdgeTypes, type NodeTypes } from '@xyflow/react';
import { AnimatePresence, motion } from 'framer-motion';
import { List, Maximize2, MousePointerClick, Tag, Workflow, X, ZoomIn, ZoomOut } from 'lucide-react';
import { CATEGORIES } from '@/lib/categories';
import { cn } from '@/lib/cn';
import { useElementWidth } from '@/lib/hooks';
import { dismissHint, useProgress } from '@/lib/progress';
import { useTheme } from '@/lib/theme';
import type { ServiceCategory } from '@/lib/types';
import { ArchNodeView, nodeVisuals, type ArchFlowNode } from './ArchNodeView';
import { useDiagram } from './DiagramContext';
import { DiagramListView } from './DiagramListView';
import { FloatingEdge, type ArchFlowEdge } from './FloatingEdge';
import { diagramHeight, nodePosition, type LayoutMode } from './layout';
import { NodePanel } from './NodePanel';
import { NowPlaying } from './NowPlaying';

const nodeTypes: NodeTypes = { arch: ArchNodeView };
const edgeTypes: EdgeTypes = { floating: FloatingEdge };

interface Props {
  className?: string;
  /** Show the "now playing" caption overlay inside the diagram. */
  showNowPlaying?: boolean;
  /** Label for screen readers, e.g. "DropVault architecture". */
  title: string;
}

export function ArchitectureDiagram(props: Props) {
  return (
    <ReactFlowProvider>
      <DiagramCanvas {...props} />
    </ReactFlowProvider>
  );
}

function ToolbarButton({
  label,
  onClick,
  active,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={active}
      title={label}
      className={cn(
        'flex h-9 w-9 items-center justify-center rounded-lg transition-colors',
        active ? 'bg-brand-500 text-navy-950' : 'text-muted hover:bg-surface-2 hover:text-ink',
      )}
    >
      {children}
    </button>
  );
}

function DiagramCanvas({ className, showNowPlaying = true, title }: Props) {
  const d = useDiagram();
  const { theme } = useTheme();
  const wrapRef = useRef<HTMLDivElement>(null);
  const width = useElementWidth(wrapRef);
  const mode: LayoutMode = width > 0 && width < 640 ? 'mobile' : 'desktop';
  const [listView, setListView] = useState(false);
  const [zoomedIn, setZoomedIn] = useState(false);
  const hintDismissed = useProgress((s) => !!s.hints['diagram-hint']);
  const rf = useReactFlow();
  const archNodes = d.source.architecture.nodes;

  const nodes: ArchFlowNode[] = useMemo(
    () =>
      archNodes.map((n) => ({
        id: n.id,
        type: 'arch',
        position: nodePosition(n, mode),
        data: { arch: n, mode },
        draggable: false,
        selectable: false,
        focusable: false,
      })),
    [archNodes, mode],
  );

  const edges: ArchFlowEdge[] = useMemo(
    () =>
      d.source.architecture.edges.map((e) => ({
        id: e.id,
        source: e.source,
        target: e.target,
        type: 'floating',
        data: { arch: e },
        focusable: false,
        selectable: false,
      })),
    [d.source.architecture.edges],
  );

  const height = width ? diagramHeight(archNodes, mode, width) : 480;

  // Refit when the size or layout changes.
  useEffect(() => {
    if (!width || listView) return;
    const t = window.setTimeout(() => {
      rf.fitView({ padding: mode === 'mobile' ? 0.05 : 0.06, duration: 0 });
      setZoomedIn(false);
    }, 40);
    return () => window.clearTimeout(t);
  }, [width, height, mode, rf, listView]);

  const categories = useMemo(() => {
    const set = new Set<ServiceCategory>();
    archNodes.forEach((n) => {
      const s = nodeVisuals(n).service;
      if (s) set.add(s.category);
    });
    return [...set];
  }, [archNodes]);

  return (
    <div className={cn('relative min-w-0', className)}>
      <div
        className="overflow-hidden rounded-3xl border border-line bg-surface shadow-soft"
        role="group"
        aria-label={title}
      >
        {/* Header: hint + toolbar (outside the canvas so nothing covers a box) */}
        <div className="flex items-center gap-2 border-b border-line px-2 py-1.5 sm:px-3">
          <div className="min-w-0 flex-1">
            <AnimatePresence initial={false} mode="wait">
              {!hintDismissed ? (
                <motion.div
                  key="hint"
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  className="inline-flex max-w-full items-center gap-1.5 rounded-lg bg-navy-900 py-1 pl-2.5 pr-1 text-xs font-bold text-white dark:bg-navy-100 dark:text-navy-950"
                >
                  <MousePointerClick
                    className="h-4 w-4 shrink-0 text-brand-400 dark:text-brand-600"
                    aria-hidden="true"
                  />
                  <span className="truncate">Tap any box to see what it does</span>
                  <button
                    type="button"
                    onClick={() => dismissHint('diagram-hint')}
                    className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md hover:bg-white/15 dark:hover:bg-navy-950/10"
                    aria-label="Dismiss hint"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </motion.div>
              ) : (
                <motion.p
                  key="label"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="truncate px-1 text-xs font-bold text-muted"
                >
                  {listView ? 'List view' : 'Tap a box for details'}
                </motion.p>
              )}
            </AnimatePresence>
          </div>
          <div className="flex shrink-0 items-center gap-0.5">
            {!listView && (
              <>
                <ToolbarButton
                  label="Zoom in"
                  onClick={() => {
                    rf.zoomIn({ duration: 200 });
                    setZoomedIn(true);
                  }}
                >
                  <ZoomIn className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton label="Zoom out" onClick={() => rf.zoomOut({ duration: 200 })}>
                  <ZoomOut className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  label="Fit to view"
                  onClick={() => {
                    rf.fitView({ padding: 0.1, duration: 250 });
                    setZoomedIn(false);
                  }}
                >
                  <Maximize2 className="h-4 w-4" />
                </ToolbarButton>
                <ToolbarButton
                  label="Show all labels"
                  active={d.showAllLabels}
                  onClick={() => d.setShowAllLabels(!d.showAllLabels)}
                >
                  <Tag className="h-4 w-4" />
                </ToolbarButton>
              </>
            )}
            <ToolbarButton
              label={listView ? 'Show diagram' : 'Show as a list'}
              active={listView}
              onClick={() => setListView(!listView)}
            >
              {listView ? <Workflow className="h-4 w-4" /> : <List className="h-4 w-4" />}
            </ToolbarButton>
          </div>
        </div>

        <div
          ref={wrapRef}
          className="hub-flow dot-grid relative overflow-hidden bg-surface-2/40"
          style={{ height: listView ? 'auto' : height }}
        >
          {listView ? (
            <DiagramListView />
          ) : (
            width > 0 && (
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                edgeTypes={edgeTypes}
                colorMode={theme}
                fitView
                fitViewOptions={{ padding: 0.1 }}
                minZoom={0.3}
                maxZoom={2.2}
                nodesDraggable={false}
                nodesConnectable={false}
                nodesFocusable={false}
                edgesFocusable={false}
                elementsSelectable={false}
                disableKeyboardA11y
                zoomOnScroll={false}
                zoomOnDoubleClick={false}
                panOnScroll={false}
                preventScrolling={false}
                panOnDrag={mode === 'desktop' || zoomedIn}
                onEdgeClick={(_, e) => d.setTappedEdgeId(d.tappedEdgeId === e.id ? null : e.id)}
                onEdgeMouseEnter={(_, e) => d.setHoveredEdgeId(e.id)}
                onEdgeMouseLeave={() => d.setHoveredEdgeId(null)}
                onPaneClick={() => d.setTappedEdgeId(null)}
                proOptions={{ hideAttribution: true }}
              />
            )
          )}
        </div>

        {/* Legend */}
        {!listView && (
          <div className="flex flex-wrap gap-x-3 gap-y-1 border-t border-line px-3 py-2 text-2xs font-bold text-muted">
            {categories.map((c) => (
              <span key={c} className="flex items-center gap-1.5">
                <span className="h-2 w-2 rounded-full" style={{ backgroundColor: CATEGORIES[c].color }} />
                {CATEGORIES[c].label}
              </span>
            ))}
            <span className="flex items-center gap-1.5">
              <span className="h-2 w-3 rounded-sm border-2 border-dashed border-slate-400" />
              People and outside systems
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-4 border-t-2 border-dashed border-slate-400" />
              Background traffic
            </span>
          </div>
        )}
      </div>

      {/* Caption below the diagram; sticks to the bottom of the screen while the diagram is in view. */}
      {showNowPlaying && <NowPlaying className="sticky bottom-3 z-30 mt-3 lg:hidden" />}
      <NodePanel />
    </div>
  );
}
