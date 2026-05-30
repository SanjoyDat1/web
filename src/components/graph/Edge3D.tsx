import { Line } from '@react-three/drei'
import type { SimLink, SimNode } from '../../lib/graph/simulation'

// Single neutral gray family — all edges match on a white background
const EDGE_COLOR: Record<string, string> = {}

const DEFAULT_COLOR = '#d8d8d8'

type Props = {
  link: SimLink
  nodeZ: Map<string, number>
  focused: boolean
  width: number
  height: number
}

export function Edge3D({ link, nodeZ, focused, width, height }: Props) {
  const s = link.source as SimNode
  const t = link.target as SimNode
  if (s.x == null || t.x == null) return null

  const sx = s.x - width / 2
  const sy = -(s.y! - height / 2)
  const sz = nodeZ.get(s.id) ?? 0
  const tx = t.x - width / 2
  const ty = -(t.y! - height / 2)
  const tz = nodeZ.get(t.id) ?? 0

  const color = focused ? '#9a9aaa' : (EDGE_COLOR[link.kind] ?? DEFAULT_COLOR)
  const opacity = focused ? Math.min(0.75, 0.32 + link.weight * 0.43) : 0.55

  return (
    <Line
      points={[[sx, sy, sz], [tx, ty, tz]]}
      color={color}
      lineWidth={focused ? 1.0 : 0.6}
      transparent
      opacity={opacity}
    />
  )
}
