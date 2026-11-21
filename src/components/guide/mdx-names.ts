/**
 * Names of every component available inside MDX files. The validator imports this list
 * to catch typos like <Chekpoint>. Keep in sync with mdxComponents.tsx.
 */
export const MDX_COMPONENT_NAMES = [
  'Step',
  'Prerequisite',
  'Command',
  'ConsoleStep',
  'Checkpoint',
  'Cleanup',
  'Callout',
  'Quiz',
  'FaqItem',
  'FaqList',
  'KeyConcepts',
  'Concept',
  'WhenToUse',
  'Term',
  'CodeBlock',
  'ServiceChip',
] as const;
