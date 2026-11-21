import type { FaqItem } from '../../lib/types';

/** General beginner FAQ shown on /faq. Answers use markdown-lite (see src/lib/markdown.tsx). */
export const faqItems: FaqItem[] = [
  {
    id: 'is-aws-free',
    group: 'account',
    question: 'Is AWS free for students?',
    answer:
      'Many services have a Free Tier, and everything on this site is designed to cost little or nothing at class scale. You still need a payment card to sign up. Set a [billing alarm](/setup/billing-alarm) on day one so you always know where you stand. TODO(verify): current Free Tier terms for new accounts.',
    tags: ['free tier', 'cost', 'card'],
  },
];
