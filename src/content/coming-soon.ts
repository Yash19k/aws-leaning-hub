import type { ComingSoonProject } from '../lib/types';

/** Projects that are planned but not written yet (shown as "coming soon" cards). */
export const comingSoon: ComingSoonProject[] = [
  {
    slug: 'github-analytics',
    title: 'GitHub Repo Analytics',
    tagline: 'Keep your GitHub traffic stats forever, collected on a schedule and charted on a dashboard.',
    difficulty: 'intermediate',
    services: ['lambda', 'eventbridge', 'dynamodb', 'api-gateway'],
  },
];
