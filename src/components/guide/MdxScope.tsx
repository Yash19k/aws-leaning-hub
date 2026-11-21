import type { ReactNode } from 'react';
import { MDXProvider } from '@mdx-js/react';
import { mdxComponents } from './mdxComponents';

/**
 * Provides the guide components to MDX content. Used only by pages that render MDX, so the
 * code highlighter and guide components stay out of the home page's bundle.
 */
export function MdxScope({ children }: { children: ReactNode }) {
  return <MDXProvider components={mdxComponents}>{children}</MDXProvider>;
}
