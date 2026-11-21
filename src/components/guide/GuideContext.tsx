import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { setGuideCompleted, useProgress } from '@/lib/progress';

export interface RegisteredStep {
  number: number;
  title: string;
}

interface GuideCtx {
  guideId: string;
  steps: RegisteredStep[];
  doneCount: number;
  total: number;
  isDone: (n: number) => boolean;
  register: (s: RegisteredStep) => void;
  unregister: (n: number) => void;
}

const Ctx = createContext<GuideCtx | null>(null);

export function useGuide(): GuideCtx | null {
  return useContext(Ctx);
}

/** Wrap a guide's MDX so <Step> components can track progress and build a table of contents. */
export function GuideProvider({ guideId, children }: { guideId: string; children: ReactNode }) {
  const [registered, setRegistered] = useState<Map<number, string>>(new Map());
  const doneMap = useProgress((s) => s.steps[guideId]);
  const completed = useProgress((s) => !!s.guidesCompleted[guideId]);

  const register = useCallback((s: RegisteredStep) => {
    setRegistered((m) => (m.get(s.number) === s.title ? m : new Map(m).set(s.number, s.title)));
  }, []);
  const unregister = useCallback((n: number) => {
    setRegistered((m) => {
      if (!m.has(n)) return m;
      const next = new Map(m);
      next.delete(n);
      return next;
    });
  }, []);

  const steps = useMemo(
    () => [...registered.entries()].map(([number, title]) => ({ number, title })).sort((a, b) => a.number - b.number),
    [registered],
  );
  const isDone = useCallback((n: number) => !!doneMap?.[String(n)], [doneMap]);
  const doneCount = steps.filter((s) => isDone(s.number)).length;
  const total = steps.length;

  useEffect(() => {
    if (!total) return;
    const all = doneCount === total;
    if (all !== completed) setGuideCompleted(guideId, all);
  }, [doneCount, total, completed, guideId]);

  return <Ctx.Provider value={{ guideId, steps, doneCount, total, isDone, register, unregister }}>{children}</Ctx.Provider>;
}
