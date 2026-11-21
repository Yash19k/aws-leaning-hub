/**
 * Progress tracking, stored in localStorage (wrapped so the site works when storage is blocked).
 *
 * Guide ids:  "setup:<slug>"  for setup guides,  "build:<projectSlug>"  for project build guides.
 */
import { useSyncExternalStore } from 'react';
import { readJson, removeStorage, writeJson } from './storage';

export type OS = 'windows' | 'mac' | 'linux';

export interface ProgressState {
  version: 1;
  /** guideId -> stepKey -> done */
  steps: Record<string, Record<string, boolean>>;
  /** guideId -> completedAt (ms) */
  guidesCompleted: Record<string, number>;
  /** projectSlug -> node ids opened in the diagram */
  nodesOpened: Record<string, string[]>;
  /** projectSlug -> flow ids watched to the end */
  flowsCompleted: Record<string, string[]>;
  /** quizId -> answered correctly */
  quizzes: Record<string, boolean>;
  /** badgeId -> earnedAt (ms) */
  badges: Record<string, number>;
  os?: OS;
  /** Dismissed hints. */
  hints: Record<string, boolean>;
}

const KEY = 'awshub:progress:v1';

/** Use as a fallback in selectors (a new [] each call would make useSyncExternalStore loop). */
export const EMPTY_LIST: readonly string[] = Object.freeze([]);

const EMPTY: ProgressState = {
  version: 1,
  steps: {},
  guidesCompleted: {},
  nodesOpened: {},
  flowsCompleted: {},
  quizzes: {},
  badges: {},
  hints: {},
};

function load(): ProgressState {
  const raw = readJson<Partial<ProgressState>>(KEY, {});
  return { ...EMPTY, ...raw, version: 1 };
}

let state: ProgressState = typeof window === 'undefined' ? EMPTY : load();
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function update(fn: (s: ProgressState) => ProgressState) {
  state = fn(state);
  writeJson(KEY, state);
  emit();
}

if (typeof window !== 'undefined') {
  // Keep tabs in sync.
  window.addEventListener('storage', (e) => {
    if (e.key === KEY) {
      state = load();
      emit();
    }
  });
}

export function getProgress(): ProgressState {
  return state;
}

export function subscribeProgress(cb: () => void): () => void {
  listeners.add(cb);
  return () => listeners.delete(cb);
}

export function useProgress<T>(select: (s: ProgressState) => T): T {
  return useSyncExternalStore(
    subscribeProgress,
    () => select(state),
    () => select(EMPTY),
  );
}

// ---------------------------------------------------------------- actions

export function setStepDone(guideId: string, stepKey: string, done: boolean) {
  update((s) => ({
    ...s,
    steps: { ...s.steps, [guideId]: { ...(s.steps[guideId] ?? {}), [stepKey]: done } },
  }));
}

export function setGuideCompleted(guideId: string, completed: boolean) {
  update((s) => {
    const next = { ...s.guidesCompleted };
    if (completed) next[guideId] = next[guideId] ?? Date.now();
    else delete next[guideId];
    return { ...s, guidesCompleted: next };
  });
}

export function markNodeOpened(projectSlug: string, nodeId: string) {
  const list = state.nodesOpened[projectSlug] ?? [];
  if (list.includes(nodeId)) return;
  update((s) => ({ ...s, nodesOpened: { ...s.nodesOpened, [projectSlug]: [...list, nodeId] } }));
}

export function markFlowCompleted(projectSlug: string, flowId: string) {
  const list = state.flowsCompleted[projectSlug] ?? [];
  if (list.includes(flowId)) return;
  update((s) => ({ ...s, flowsCompleted: { ...s.flowsCompleted, [projectSlug]: [...list, flowId] } }));
}

export function recordQuiz(quizId: string, correct: boolean) {
  // First answer counts; retries can upgrade a wrong answer to right.
  if (state.quizzes[quizId] === true) return;
  update((s) => ({ ...s, quizzes: { ...s.quizzes, [quizId]: correct } }));
}

export function awardBadges(ids: string[]) {
  const fresh = ids.filter((id) => !state.badges[id]);
  if (!fresh.length) return [];
  const now = Date.now();
  update((s) => ({ ...s, badges: { ...s.badges, ...Object.fromEntries(fresh.map((id) => [id, now])) } }));
  return fresh;
}

export function setPreferredOS(os: OS) {
  update((s) => ({ ...s, os }));
}

export function dismissHint(id: string) {
  update((s) => ({ ...s, hints: { ...s.hints, [id]: true } }));
}

export function resetProgress() {
  const os = state.os;
  removeStorage(KEY);
  state = { ...EMPTY, os };
  writeJson(KEY, state);
  emit();
}

// ---------------------------------------------------------------- helpers

export function detectOS(): OS {
  if (typeof navigator === 'undefined') return 'windows';
  const ua = navigator.userAgent.toLowerCase();
  if (ua.includes('mac')) return 'mac';
  if (ua.includes('linux') || ua.includes('x11') || ua.includes('cros')) return 'linux';
  return 'windows';
}

export function usePreferredOS(): OS {
  return useProgress((s) => s.os) ?? detectOS();
}

export const setupGuideId = (slug: string) => `setup:${slug}`;
export const buildGuideId = (slug: string) => `build:${slug}`;
