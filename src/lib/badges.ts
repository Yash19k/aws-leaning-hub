import { useEffect } from 'react';
import { Award, BadgeCheck, Brain, Compass, Footprints, Hammer, Route, ShieldCheck, type LucideIcon } from 'lucide-react';
import { guides, projects } from './content';
import { awardBadges, buildGuideId, getProgress, setupGuideId, subscribeProgress, type ProgressState } from './progress';

export interface BadgeDef {
  id: string;
  title: string;
  description: string;
  icon: LucideIcon;
  color: string;
  progress: (s: ProgressState) => { value: number; max: number };
}

const QUIZ_TARGET = 5;

function countSteps(s: ProgressState) {
  return Object.values(s.steps).reduce((n, g) => n + Object.values(g).filter(Boolean).length, 0);
}

export function badgeCatalog(): BadgeDef[] {
  const required = guides.filter((g) => !g.optional);
  const list: BadgeDef[] = [
    {
      id: 'first-step',
      title: 'First Step',
      description: 'Ticked off your first step in any guide.',
      icon: Footprints,
      color: '#14B09F',
      progress: (s) => ({ value: Math.min(1, countSteps(s)), max: 1 }),
    },
    {
      id: 'safety-net',
      title: 'Safety Net',
      description: 'Secured the root user and set a billing alarm.',
      icon: ShieldCheck,
      color: '#E5484D',
      progress: (s) => ({
        value: ['secure-your-account', 'billing-alarm'].filter((g) => s.guidesCompleted[setupGuideId(g)]).length,
        max: 2,
      }),
    },
    {
      id: 'account-ready',
      title: 'Account Ready',
      description: 'Finished every setup guide. You are ready to build anything here.',
      icon: BadgeCheck,
      color: '#FF9900',
      progress: (s) => ({ value: required.filter((g) => s.guidesCompleted[setupGuideId(g.slug)]).length, max: required.length }),
    },
    {
      id: 'explorer',
      title: 'Explorer',
      description: 'Opened every box in one project diagram.',
      icon: Compass,
      color: '#8B5CF6',
      progress: (s) => {
        let best = 0;
        let max = 1;
        for (const p of projects) {
          const opened = (s.nodesOpened[p.slug] ?? []).filter((id) => p.architecture.nodes.some((n) => n.id === id)).length;
          const ratio = opened / p.architecture.nodes.length;
          if (ratio >= best / max) {
            best = opened;
            max = p.architecture.nodes.length;
          }
        }
        return { value: best, max };
      },
    },
    {
      id: 'flow-watcher',
      title: 'Flow Watcher',
      description: 'Watched every request flow of one project to the end.',
      icon: Route,
      color: '#0E9CC9',
      progress: (s) => {
        let best = 0;
        let max = 1;
        for (const p of projects) {
          const done = (s.flowsCompleted[p.slug] ?? []).filter((id) => p.flows.some((f) => f.id === id)).length;
          if (p.flows.length && done / p.flows.length >= best / max) {
            best = done;
            max = p.flows.length;
          }
        }
        return { value: best, max };
      },
    },
    {
      id: 'quiz-whiz',
      title: 'Quiz Whiz',
      description: `Answered ${QUIZ_TARGET} quick checks correctly.`,
      icon: Brain,
      color: '#3B6FE0',
      progress: (s) => ({ value: Math.min(QUIZ_TARGET, Object.values(s.quizzes).filter(Boolean).length), max: QUIZ_TARGET }),
    },
  ];
  for (const p of projects) {
    list.push({
      id: `built-${p.slug}`,
      title: `${p.title.split(':')[0]} Builder`,
      description: `Built and deployed ${p.title.split(':')[0]} yourself, start to finish.`,
      icon: p.difficulty === 'advanced' ? Award : Hammer,
      color: p.difficulty === 'advanced' ? '#D6409F' : '#1F9D55',
      progress: (s) => ({ value: s.guidesCompleted[buildGuideId(p.slug)] ? 1 : 0, max: 1 }),
    });
  }
  return list;
}

export function isEarned(def: BadgeDef, s: ProgressState): boolean {
  const { value, max } = def.progress(s);
  return max > 0 && value >= max;
}

// ---------------------------------------------------------------- celebration queue

type Listener = (ids: string[]) => void;
const celebrationListeners = new Set<Listener>();

export function onBadgesEarned(l: Listener) {
  celebrationListeners.add(l);
  return () => {
    celebrationListeners.delete(l);
  };
}

/** Mount once (in the layout): awards badges whenever progress changes. */
export function useBadgeWatcher() {
  useEffect(() => {
    const catalog = badgeCatalog();
    const check = () => {
      const s = getProgress();
      const earned = catalog.filter((b) => !s.badges[b.id] && isEarned(b, s)).map((b) => b.id);
      if (earned.length) {
        const fresh = awardBadges(earned);
        if (fresh.length) celebrationListeners.forEach((l) => l(fresh));
      }
    };
    check();
    return subscribeProgress(check);
  }, []);
}
