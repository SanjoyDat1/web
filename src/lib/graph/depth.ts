import type { GraphNode } from '../../types/graph'

export type DepthLevel = 'foreground' | 'midground' | 'background'

export function computeDepthScore(node: GraphNode): number {
  return node.importance * 0.6 + node.recency * 0.4
}

export function computeDepth(node: GraphNode): DepthLevel {
  const score = computeDepthScore(node)
  if (score > 0.7) return 'foreground'
  if (score > 0.35) return 'midground'
  return 'background'
}

export const DEPTH_OPACITY: Record<DepthLevel, number> = {
  foreground: 1,
  midground: 0.78,
  background: 0.28,
}

export const DEPTH_BLUR: Record<DepthLevel, string> = {
  foreground: 'none',
  midground: 'blur(0.8px)',
  background: 'blur(3px)',
}

export const DEPTH_RADIUS_OFFSET: Record<DepthLevel, number> = {
  foreground: 6,
  midground: 0,
  background: -4,
}
