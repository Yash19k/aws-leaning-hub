import type { ArchNode, Point } from '@/lib/types';

export type LayoutMode = 'desktop' | 'mobile';

export const NODE_SIZE: Record<LayoutMode, { w: number; h: number }> = {
  desktop: { w: 176, h: 64 },
  mobile: { w: 156, h: 60 },
};

export function nodePosition(node: ArchNode, mode: LayoutMode): Point {
  if (mode === 'desktop') return node.position;
  return node.mobilePosition ?? { x: node.position.y, y: node.position.x };
}

/** Bounding box of a layout (including node size). */
export function layoutBox(nodes: ArchNode[], mode: LayoutMode) {
  const { w, h } = NODE_SIZE[mode];
  let minX = Infinity;
  let minY = Infinity;
  let maxX = -Infinity;
  let maxY = -Infinity;
  for (const n of nodes) {
    const p = nodePosition(n, mode);
    minX = Math.min(minX, p.x);
    minY = Math.min(minY, p.y);
    maxX = Math.max(maxX, p.x + w);
    maxY = Math.max(maxY, p.y + h);
  }
  if (!nodes.length) return { width: 1, height: 1 };
  return { width: maxX - minX, height: maxY - minY };
}

/** Pick a container height that shows the whole layout at a readable scale. */
export function diagramHeight(nodes: ArchNode[], mode: LayoutMode, containerWidth: number): number {
  const box = layoutBox(nodes, mode);
  const pad = mode === 'mobile' ? 48 : 80;
  const aspect = (box.height + pad) / (box.width + pad);
  const raw = containerWidth * aspect;
  return mode === 'mobile' ? Math.min(1250, Math.max(420, raw)) : Math.min(680, Math.max(380, raw));
}

interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** Where the line from rect a's centre to rect b's centre leaves rect a. */
export function borderPoint(a: Rect, b: Rect): Point {
  const ax = a.x + a.w / 2;
  const ay = a.y + a.h / 2;
  const bx = b.x + b.w / 2;
  const by = b.y + b.h / 2;
  const dx = bx - ax;
  const dy = by - ay;
  if (dx === 0 && dy === 0) return { x: ax, y: ay };
  const scale = 1 / Math.max(Math.abs(dx) / (a.w / 2), Math.abs(dy) / (a.h / 2));
  return { x: ax + dx * scale, y: ay + dy * scale };
}

export function easeInOut(t: number): number {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
