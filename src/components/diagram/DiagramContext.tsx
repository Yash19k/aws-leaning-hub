/**
 * Shared state for one project's diagram, FlowPlayer, WhatIfCards and CodePeek,
 * so they all stay in sync.
 *
 * Flow playback model:
 *   phase 'travel' -> a dot moves along the step's edge (clock lives here, 60fps store)
 *   phase 'dwell'  -> the destination glows; the caption stays up for reading time
 *   phase 'done'   -> finished; Replay restarts
 * `playing` = auto-advance. `hold` = frozen by Pause (also freezes a dot mid-edge).
 */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react';
import { useReducedMotion } from '@/lib/hooks';
import { markFlowCompleted, markNodeOpened } from '@/lib/progress';
import type { ArchEdge, ArchNode, FlowStep, Project, RequestFlow } from '@/lib/types';

export type DiagramSource = Pick<Project, 'slug' | 'architecture' | 'services' | 'codePeeks' | 'flows'> & {
  githubUrl?: string;
  githubBranch?: string;
};

// ---------------------------------------------------------------- tiny 60fps store for the travelling dot

function createTravelStore() {
  let value = 0;
  const listeners = new Set<() => void>();
  return {
    get: () => value,
    set(v: number) {
      value = v;
      listeners.forEach((l) => l());
    },
    subscribe(l: () => void) {
      listeners.add(l);
      return () => {
        listeners.delete(l);
      };
    },
  };
}
type TravelStore = ReturnType<typeof createTravelStore>;

// ---------------------------------------------------------------- flow reducer

interface FlowState {
  flowId: string | null;
  stepIndex: number;
  phase: 'travel' | 'dwell' | 'done';
  playing: boolean;
  hold: boolean;
  speed: number;
  runId: number;
}

type FlowAction =
  | { type: 'select'; flowId: string; autoplay: boolean }
  | { type: 'goto'; index: number }
  | { type: 'play' }
  | { type: 'pause' }
  | { type: 'restart'; autoplay: boolean }
  | { type: 'stop' }
  | { type: 'arrived' }
  | { type: 'finish' }
  | { type: 'speed'; speed: number };

const initialFlow: FlowState = {
  flowId: null,
  stepIndex: 0,
  phase: 'travel',
  playing: false,
  hold: false,
  speed: 1,
  runId: 0,
};

function flowReducer(s: FlowState, a: FlowAction): FlowState {
  switch (a.type) {
    case 'select':
      return { ...s, flowId: a.flowId, stepIndex: 0, phase: 'travel', playing: a.autoplay, hold: false, runId: s.runId + 1 };
    case 'goto':
      return { ...s, stepIndex: a.index, phase: 'travel', hold: false, runId: s.runId + 1 };
    case 'play':
      if (s.phase === 'done') return { ...s, stepIndex: 0, phase: 'travel', playing: true, hold: false, runId: s.runId + 1 };
      return { ...s, playing: true, hold: false };
    case 'pause':
      return { ...s, playing: false, hold: true };
    case 'restart':
      return { ...s, stepIndex: 0, phase: 'travel', playing: a.autoplay, hold: false, runId: s.runId + 1 };
    case 'stop':
      return { ...initialFlow, speed: s.speed, runId: s.runId + 1 };
    case 'arrived':
      return s.phase === 'travel' ? { ...s, phase: 'dwell' } : s;
    case 'finish':
      return { ...s, phase: 'done', playing: false };
    case 'speed':
      return { ...s, speed: a.speed };
  }
}

export const TRAVEL_MS = 1250;
export function dwellMs(step: FlowStep | undefined): number {
  if (!step) return 3000;
  return Math.min(7500, Math.max(2600, 1500 + step.explanation.length * 30));
}

// ---------------------------------------------------------------- context

interface DiagramContextValue {
  source: DiagramSource;
  nodesById: Map<string, ArchNode>;
  edgesById: Map<string, ArchEdge>;

  selectedNodeId: string | null;
  openNode: (id: string) => void;
  closeNode: () => void;

  hoveredNodeId: string | null;
  setHoveredNodeId: (id: string | null) => void;
  hoveredEdgeId: string | null;
  setHoveredEdgeId: (id: string | null) => void;
  tappedEdgeId: string | null;
  setTappedEdgeId: (id: string | null) => void;
  showAllLabels: boolean;
  setShowAllLabels: (v: boolean) => void;

  highlight: { ids: string[]; label: string } | null;
  setHighlight: (ids: string[], label: string) => void;
  clearHighlight: () => void;

  peekId: string | null;
  openPeek: (id: string) => void;
  closePeek: () => void;

  // flows
  flow: FlowState;
  currentFlow: RequestFlow | undefined;
  currentStep: FlowStep | undefined;
  activeEdgeId: string | null;
  activeReverse: boolean;
  activeNodeIds: Set<string>;
  trailEdgeIds: Set<string>;
  flowNodeIds: Set<string>;
  flowEdgeIds: Set<string>;
  travel: TravelStore;
  selectFlow: (id: string) => void;
  gotoStep: (index: number) => void;
  next: () => void;
  prev: () => void;
  play: () => void;
  pause: () => void;
  restart: () => void;
  stopFlow: () => void;
  setSpeed: (n: number) => void;
  reducedMotion: boolean;
}

const Ctx = createContext<DiagramContextValue | null>(null);

export function useDiagram(): DiagramContextValue {
  const v = useContext(Ctx);
  if (!v) throw new Error('useDiagram must be used inside <DiagramProvider>');
  return v;
}

/** Subscribe to the travelling-dot progress (0..1) without re-rendering the whole diagram. */
export function useTravelProgress(store: TravelStore, active: boolean): number {
  return useSyncExternalStore(
    active ? store.subscribe : noopSubscribe,
    active ? store.get : zero,
    zero,
  );
}
const noopSubscribe = () => () => {};
const zero = () => 0;

export function DiagramProvider({ source, children }: { source: DiagramSource; children: ReactNode }) {
  const reducedMotion = useReducedMotion();
  const nodesById = useMemo(() => new Map(source.architecture.nodes.map((n) => [n.id, n])), [source]);
  const edgesById = useMemo(() => new Map(source.architecture.edges.map((e) => [e.id, e])), [source]);

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);
  const [hoveredEdgeId, setHoveredEdgeId] = useState<string | null>(null);
  const [tappedEdgeId, setTappedEdgeId] = useState<string | null>(null);
  const [showAllLabels, setShowAllLabels] = useState(false);
  const [highlight, setHighlightState] = useState<{ ids: string[]; label: string } | null>(null);
  const [peekId, setPeekId] = useState<string | null>(null);
  const [flow, dispatch] = useReducer(flowReducer, initialFlow);
  const [travel] = useState(createTravelStore);

  const currentFlow = source.flows.find((f) => f.id === flow.flowId);
  const currentStep = currentFlow?.steps[flow.stepIndex];

  // ---------------- derived flow visuals
  const derived = useMemo(() => {
    const activeNodeIds = new Set<string>();
    const trailEdgeIds = new Set<string>();
    const flowNodeIds = new Set<string>();
    const flowEdgeIds = new Set<string>();
    let activeEdgeId: string | null = null;
    let activeReverse = false;
    if (currentFlow) {
      currentFlow.steps.forEach((st, i) => {
        if (st.edgeId) {
          const e = edgesById.get(st.edgeId);
          flowEdgeIds.add(st.edgeId);
          if (e) {
            flowNodeIds.add(e.source);
            flowNodeIds.add(e.target);
          }
          if (i < flow.stepIndex) trailEdgeIds.add(st.edgeId);
        }
        if (st.nodeId) flowNodeIds.add(st.nodeId);
      });
      if (currentStep?.edgeId) {
        const e = edgesById.get(currentStep.edgeId);
        activeEdgeId = currentStep.edgeId;
        activeReverse = !!currentStep.reverse;
        if (e) {
          const from = activeReverse ? e.target : e.source;
          const to = activeReverse ? e.source : e.target;
          activeNodeIds.add(flow.phase === 'travel' ? from : to);
        }
      } else if (currentStep?.nodeId) {
        activeNodeIds.add(currentStep.nodeId);
      }
    }
    return { activeNodeIds, trailEdgeIds, flowNodeIds, flowEdgeIds, activeEdgeId, activeReverse };
  }, [currentFlow, currentStep, edgesById, flow.stepIndex, flow.phase]);

  // ---------------- travel clock
  useLayoutEffect(() => {
    travel.set(0);
  }, [flow.runId, travel]);

  useEffect(() => {
    if (!currentFlow || flow.phase !== 'travel') return;
    if (!currentStep?.edgeId || reducedMotion) {
      travel.set(1);
      dispatch({ type: 'arrived' });
      return;
    }
    if (flow.hold) return;
    let raf = 0;
    let last = performance.now();
    const duration = TRAVEL_MS / flow.speed;
    const tick = (now: number) => {
      const next = Math.min(1, travel.get() + (now - last) / duration);
      last = now;
      travel.set(next);
      if (next >= 1) {
        dispatch({ type: 'arrived' });
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [currentFlow, currentStep, flow.phase, flow.hold, flow.speed, flow.runId, reducedMotion, travel]);

  // ---------------- auto-advance
  useEffect(() => {
    if (!currentFlow || flow.phase !== 'dwell' || !flow.playing || flow.hold) return;
    const t = window.setTimeout(() => {
      if (flow.stepIndex < currentFlow.steps.length - 1) dispatch({ type: 'goto', index: flow.stepIndex + 1 });
      else dispatch({ type: 'finish' });
    }, dwellMs(currentStep) / flow.speed);
    return () => window.clearTimeout(t);
  }, [currentFlow, currentStep, flow.phase, flow.playing, flow.hold, flow.stepIndex, flow.speed, flow.runId]);

  // Watching the last step counts as completing the flow.
  useEffect(() => {
    if (currentFlow && flow.phase !== 'travel' && flow.stepIndex === currentFlow.steps.length - 1) {
      markFlowCompleted(source.slug, currentFlow.id);
    }
  }, [currentFlow, flow.phase, flow.stepIndex, source.slug]);

  // ---------------- actions
  const openNode = useCallback(
    (id: string) => {
      setSelectedNodeId(id);
      markNodeOpened(source.slug, id);
    },
    [source.slug],
  );
  const closeNode = useCallback(() => setSelectedNodeId(null), []);
  const setHighlight = useCallback((ids: string[], label: string) => {
    dispatch({ type: 'stop' });
    setHighlightState({ ids, label });
  }, []);
  const clearHighlight = useCallback(() => setHighlightState(null), []);
  const openPeek = useCallback((id: string) => setPeekId(id), []);
  const closePeek = useCallback(() => setPeekId(null), []);

  const selectFlow = useCallback(
    (id: string) => {
      setHighlightState(null);
      dispatch({ type: 'select', flowId: id, autoplay: !reducedMotion });
    },
    [reducedMotion],
  );
  const total = currentFlow?.steps.length ?? 0;
  const gotoStep = useCallback(
    (index: number) => {
      if (index >= 0 && index < total) dispatch({ type: 'goto', index });
    },
    [total],
  );
  const next = useCallback(() => {
    if (flow.stepIndex < total - 1) dispatch({ type: 'goto', index: flow.stepIndex + 1 });
    else dispatch({ type: 'finish' });
  }, [flow.stepIndex, total]);
  const prev = useCallback(() => {
    if (flow.stepIndex > 0) dispatch({ type: 'goto', index: flow.stepIndex - 1 });
  }, [flow.stepIndex]);
  const play = useCallback(() => dispatch({ type: 'play' }), []);
  const pause = useCallback(() => dispatch({ type: 'pause' }), []);
  const restart = useCallback(() => dispatch({ type: 'restart', autoplay: !reducedMotion }), [reducedMotion]);
  const stopFlow = useCallback(() => dispatch({ type: 'stop' }), []);
  const setSpeed = useCallback((speed: number) => dispatch({ type: 'speed', speed }), []);

  const value: DiagramContextValue = {
    source,
    nodesById,
    edgesById,
    selectedNodeId,
    openNode,
    closeNode,
    hoveredNodeId,
    setHoveredNodeId,
    hoveredEdgeId,
    setHoveredEdgeId,
    tappedEdgeId,
    setTappedEdgeId,
    showAllLabels,
    setShowAllLabels,
    highlight,
    setHighlight,
    clearHighlight,
    peekId,
    openPeek,
    closePeek,
    flow,
    currentFlow,
    currentStep,
    ...derived,
    travel,
    selectFlow,
    gotoStep,
    next,
    prev,
    play,
    pause,
    restart,
    stopFlow,
    setSpeed,
    reducedMotion,
  };

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
