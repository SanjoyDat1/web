import { useEffect, useMemo, useRef, useState } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { OrbitControls } from '@react-three/drei'
import * as THREE from 'three'
import type { SimNode, SimLink } from '../../lib/graph/simulation'
import { Node3D } from './Node3D'
import { Edge3D } from './Edge3D'
import type { LayoutMode } from '../../store/graphStore'

const Z_SCALE: Record<string, number> = {
  company: 0,
  team: 50,
  person: 180,
  client: 170,
  topic: 210,
  task: 250,
  event: 230,
  draft: 210,
  agent: 190,
  feature: 230,
  decision: 230,
  alert: 200,
}

function stableZ(id: string, scale: number): number {
  let h = 0
  for (let i = 0; i < id.length; i++) {
    h = (Math.imul(31, h) + id.charCodeAt(i)) | 0
  }
  return ((h >>> 0) / 0xffffffff - 0.5) * 2 * scale
}

function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(false)
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const onChange = () => setReduced(mq.matches)
    onChange()
    mq.addEventListener?.('change', onChange)
    return () => mq.removeEventListener?.('change', onChange)
  }, [])
  return reduced
}

type Props = {
  nodes: SimNode[]
  links: SimLink[]
  focusedIds: Set<string> | null
  hoverId: string | null
  selectedId: string | null
  width: number
  height: number
  onHover: (id: string | null) => void
  onSelect: (id: string | null) => void
  layoutMode?: LayoutMode
}

export function Graph3DCanvas({
  nodes, links, focusedIds, hoverId, selectedId,
  width, height, onHover, onSelect, layoutMode = 'free',
}: Props) {
  const nodeZ = useMemo(() => {
    const m = new Map<string, number>()
    for (const n of nodes) {
      m.set(n.id, stableZ(n.id, Z_SCALE[n.type] ?? 200))
    }
    return m
  }, [nodes])

  const focusCentroid = useMemo(() => {
    if (layoutMode !== 'focus' || !selectedId || !focusedIds) return null
    let cx = 0, cy = 0, cz = 0, count = 0
    for (const n of nodes) {
      if (!focusedIds.has(n.id) || n.x == null || n.y == null) continue
      cx += n.x - width / 2
      cy += -(n.y - height / 2)
      cz += nodeZ.get(n.id) ?? 0
      count += 1
    }
    if (count === 0) return null
    return new THREE.Vector3(cx / count, cy / count, cz / count)
  }, [layoutMode, selectedId, focusedIds, nodes, nodeZ, width, height])

  const clusterHalos = useMemo(() => {
    if (layoutMode !== 'cluster') return []
    const byTeam = new Map<string, { x: number; y: number; count: number }>()
    for (const n of nodes) {
      if (!n.team_id || n.x == null || n.y == null) continue
      const acc = byTeam.get(n.team_id) ?? { x: 0, y: 0, count: 0 }
      acc.x += n.x - width / 2
      acc.y += -(n.y - height / 2)
      acc.count += 1
      byTeam.set(n.team_id, acc)
    }
    return Array.from(byTeam.entries()).map(([teamId, acc]) => ({
      teamId,
      cx: acc.x / acc.count,
      cy: acc.y / acc.count,
      r: 60 + acc.count * 8,
    }))
  }, [layoutMode, nodes, width, height])

  return (
    <Canvas
      camera={{ position: [0, 0, 700], fov: 55 }}
      style={{ background: '#ffffff' }}
      onPointerMissed={() => onSelect(null)}
    >
      <ambientLight intensity={0.75} />
      <pointLight position={[280, 280, 380]} intensity={0.7} />
      <pointLight position={[-180, -140, -240]} intensity={0.18} />

      <FocusCameraTarget target={focusCentroid} />

      {clusterHalos.map((h) => (
        <mesh key={h.teamId} position={[h.cx, h.cy, -10]}>
          <ringGeometry args={[h.r - 1, h.r + 1, 64]} />
          <meshBasicMaterial color="#9a9a9a" transparent opacity={0.18} side={THREE.DoubleSide} />
        </mesh>
      ))}

      {links.map((l, i) => {
        const s = l.source as SimNode
        const t = l.target as SimNode
        const isFocusEdge = focusedIds
          ? focusedIds.has(s.id) && focusedIds.has(t.id)
          : true
        return (
          <Edge3D
            key={l.id ?? i}
            link={l}
            nodeZ={nodeZ}
            focused={isFocusEdge}
            width={width}
            height={height}
          />
        )
      })}

      {nodes.map((node) => {
        if (node.x == null || node.y == null) return null
        const isFocused = hoverId === node.id
        const isSelected = selectedId === node.id
        const isDimmed = focusedIds != null && !focusedIds.has(node.id)
        const x = node.x - width / 2
        const y = -(node.y - height / 2)
        const z = nodeZ.get(node.id) ?? 0
        return (
          <Node3D
            key={node.id}
            id={node.id}
            type={node.type}
            label={node.label}
            x={x}
            y={y}
            z={z}
            isFocused={isFocused}
            isSelected={isSelected}
            isDimmed={isDimmed}
            isStale={node.is_stale}
            onPointerOver={() => onHover(node.id)}
            onPointerOut={() => onHover(null)}
            onClick={() => onSelect(selectedId === node.id ? null : node.id)}
          />
        )
      })}
    </Canvas>
  )
}

function FocusCameraTarget({ target }: { target: THREE.Vector3 | null }) {
  const { controls } = useThree() as unknown as { controls: { target: THREE.Vector3; update: () => void } | undefined }
  const reducedMotion = usePrefersReducedMotion()
  const targetRef = useRef<THREE.Vector3>(new THREE.Vector3(0, 0, 0))
  const desiredRef = useRef<THREE.Vector3 | null>(null)

  useEffect(() => {
    desiredRef.current = target
    if (reducedMotion && target && controls) {
      controls.target.copy(target)
      controls.update()
    }
  }, [target, reducedMotion, controls])

  useFrame(() => {
    const desired = desiredRef.current ?? new THREE.Vector3(0, 0, 0)
    if (reducedMotion) return
    targetRef.current.lerp(desired, 0.12)
    if (controls) {
      controls.target.lerp(desired, 0.12)
      controls.update()
    }
  })

  return (
    <OrbitControls
      makeDefault
      enablePan={true}
      enableZoom={true}
      enableRotate={true}
      minDistance={80}
      maxDistance={2000}
      rotateSpeed={0.6}
      zoomSpeed={0.8}
    />
  )
}
