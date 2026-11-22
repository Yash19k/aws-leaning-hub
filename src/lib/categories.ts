import type { Difficulty, ServiceCategory } from './types';

/** One colour per AWS service category. Hex values mirror tailwind.config.ts `cat.*`. */
export const CATEGORIES: Record<ServiceCategory, { label: string; color: string; blurb: string }> = {
  storage: { label: 'Storage', color: '#1F9D55', blurb: 'Where files and objects live' },
  compute: { label: 'Compute', color: '#E8830C', blurb: 'Where your code runs' },
  database: { label: 'Database', color: '#3B6FE0', blurb: 'Where structured data lives' },
  networking: { label: 'Networking', color: '#8B5CF6', blurb: 'How requests reach your code' },
  security: { label: 'Security', color: '#E5484D', blurb: 'Who is allowed to do what' },
  management: { label: 'Management', color: '#D6409F', blurb: 'Watching and deploying things' },
  integration: { label: 'Messaging', color: '#0E9CC9', blurb: 'Events, emails and alerts' },
  frontend: { label: 'Web hosting', color: '#5F9E10', blurb: 'Putting your website online' },
  ai: { label: 'AI and ML', color: '#0D9488', blurb: 'Machine learning and generative AI' },
};

export const ACTOR_COLOR = '#64748B';

export const CATEGORY_ORDER: ServiceCategory[] = [
  'compute',
  'storage',
  'database',
  'networking',
  'security',
  'integration',
  'management',
  'frontend',
  'ai',
];

export const DIFFICULTY: Record<Difficulty, { label: string; className: string; rank: number }> = {
  beginner: {
    label: 'Beginner',
    rank: 1,
    className: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
  },
  intermediate: {
    label: 'Intermediate',
    rank: 2,
    className: 'bg-brand-100 text-brand-800 dark:bg-brand-900/50 dark:text-brand-200',
  },
  advanced: {
    label: 'Advanced',
    rank: 3,
    className: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  },
};
