import { motion } from 'framer-motion';
import { Archive, Database, Monitor, Network, Zap, type LucideIcon } from 'lucide-react';
import { useReducedMotion } from '@/lib/hooks';

interface N {
  id: string;
  x: number;
  y: number;
  label: string;
  sub: string;
  color: string;
  icon: LucideIcon;
}

const NODES: N[] = [
  { id: 'browser', x: 20, y: 150, label: 'Your browser', sub: 'React app', color: '#64748B', icon: Monitor },
  { id: 'api', x: 230, y: 150, label: 'API Gateway', sub: 'front door', color: '#8B5CF6', icon: Network },
  { id: 'lambda', x: 440, y: 150, label: 'Lambda', sub: 'your code', color: '#E8830C', icon: Zap },
  { id: 's3', x: 440, y: 20, label: 'S3', sub: 'files', color: '#1F9D55', icon: Archive },
  { id: 'db', x: 440, y: 280, label: 'DynamoDB', sub: 'data', color: '#3B6FE0', icon: Database },
];
const W = 170;
const H = 62;
const center = (id: string) => {
  const n = NODES.find((x) => x.id === id)!;
  return { x: n.x + W / 2, y: n.y + H / 2 };
};
const LINKS: [string, string][] = [
  ['browser', 'api'],
  ['api', 'lambda'],
  ['lambda', 's3'],
  ['lambda', 'db'],
  ['browser', 's3'],
];

/** Decorative animated mini-architecture for the home hero. */
export function HeroArchitecture({ className }: { className?: string }) {
  const reduced = useReducedMotion();
  return (
    <svg viewBox="0 0 640 362" className={className} role="img" aria-label="A browser talks to API Gateway, which runs a Lambda function that reads and writes S3 and DynamoDB.">
      <defs>
        <filter id="hero-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#0F1B2D" floodOpacity="0.14" />
        </filter>
      </defs>
      {LINKS.map(([a, b], i) => {
        const p = center(a);
        const q = center(b);
        const d = a === 'browser' && b === 's3' ? `M${p.x},${p.y - H / 2} C${p.x},${60} ${q.x - 200},${q.y} ${q.x - W / 2},${q.y}` : `M${p.x},${p.y} L${q.x},${q.y}`;
        return (
          <g key={i}>
            <path d={d} fill="none" stroke="currentColor" strokeOpacity={0.22} strokeWidth={3} strokeDasharray={a === 'browser' && b === 's3' ? '7 7' : undefined} />
            {!reduced && (
              <circle r={7} fill="#FF9900" stroke="white" strokeWidth={2.5}>
                <animateMotion dur={`${2.2 + i * 0.35}s`} begin={`${i * 0.5}s`} repeatCount="indefinite" path={d} keyPoints="0;1" keyTimes="0;1" calcMode="spline" keySplines="0.45 0 0.55 1" />
              </circle>
            )}
          </g>
        );
      })}
      {NODES.map((n, i) => {
        const Icon = n.icon;
        return (
          <motion.g
            key={n.id}
            initial={reduced ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.1, type: 'spring', stiffness: 200, damping: 18 }}
          >
            <g filter="url(#hero-shadow)">
              <rect x={n.x} y={n.y} width={W} height={H} rx={18} className="fill-surface" stroke={n.color} strokeOpacity={0.55} strokeWidth={2.5} strokeDasharray={n.id === 'browser' ? '7 6' : undefined} />
            </g>
            <rect x={n.x + 11} y={n.y + 11} width={40} height={40} rx={12} fill={n.color} />
            <Icon x={n.x + 21} y={n.y + 21} width={20} height={20} color="white" strokeWidth={2.2} />
            <text x={n.x + 62} y={n.y + 28} className="fill-ink" fontSize="15" fontWeight="800" fontFamily="inherit">
              {n.label}
            </text>
            <text x={n.x + 62} y={n.y + 46} className="fill-muted" fontSize="12" fontWeight="600" fontFamily="ui-monospace, monospace">
              {n.sub}
            </text>
          </motion.g>
        );
      })}
    </svg>
  );
}
