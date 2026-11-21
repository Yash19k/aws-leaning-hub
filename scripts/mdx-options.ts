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

const TODO_RE = /TODO\(verify\)/g;
const TODO_TITLE = 'Not checked yet: a human must confirm this against the AWS console or pricing page before launch.';

/** Turns "TODO(verify)" in prose into a small "verify" pill (code blocks are left alone). */
export function rehypeTodoVerify() {
  return (tree: HastNode) => {
    const walk = (node: HastNode) => {
      if (node.type === 'element' && (node.tagName === 'code' || node.tagName === 'pre')) return;
      if (!node.children) return;
      const next: HastNode[] = [];
      for (const child of node.children) {
        if (child.type === 'text' && child.value && TODO_RE.test(child.value)) {
          TODO_RE.lastIndex = 0;
          child.value.split(TODO_RE).forEach((part, i) => {
            if (i > 0) {
              next.push({
                type: 'element',
                tagName: 'span',
                properties: { className: ['todo-verify'], title: TODO_TITLE },
                children: [{ type: 'text', value: 'verify' }],
              });
            }
            if (part) next.push({ type: 'text', value: part });
          });
        } else {
          walk(child);
          next.push(child);
        }
      }
      node.children = next;
    };
    walk(tree);
  };
}

export const mdxOptions = {
  remarkPlugins: [remarkGfm],
  rehypePlugins: [rehypeCodeMetaAndSlugs, rehypeTodoVerify],
  providerImportSource: '@mdx-js/react',
};
