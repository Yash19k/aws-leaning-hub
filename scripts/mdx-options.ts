/**
 * Shared MDX options, used by Vite (vite.config.ts) and by the content validator,
 * so both compile MDX exactly the same way.
 */
import remarkGfm from 'remark-gfm';

type HastNode = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  data?: { meta?: string | null } & Record<string, unknown>;
  children?: HastNode[];
};

function textOf(node: HastNode): string {
  if (node.type === 'text') return node.value ?? '';
  return (node.children ?? []).map(textOf).join('');
}

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[`'"’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 64);
}

/**
 * - Copies a fenced code block's meta string (```yaml title="template.yaml" {3-5})
 *   onto the <code> element as `metastring`, so CodeBlock can read it.
 * - Gives h2/h3 headings an id so they can be linked to.
 */
export function rehypeCodeMetaAndSlugs() {
  return (tree: HastNode) => {
    const seen = new Map<string, number>();
    const walk = (node: HastNode) => {
      if (node.type === 'element') {
        if (node.tagName === 'code' && node.data?.meta) {
          node.properties = { ...(node.properties ?? {}), metastring: node.data.meta };
        }
        if ((node.tagName === 'h2' || node.tagName === 'h3') && !node.properties?.id) {
          const base = slugify(textOf(node)) || 'section';
          const n = seen.get(base) ?? 0;
          seen.set(base, n + 1);
          node.properties = { ...(node.properties ?? {}), id: n ? `${base}-${n}` : base };
        }
      }
      node.children?.forEach(walk);
    };
    walk(tree);
  };
}

export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeCodeMetaAndSlugs],
  providerImportSource: '@mdx-js/react',
};
