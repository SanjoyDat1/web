import { useEffect, useRef, useState } from 'react'
import { useFrame } from '@react-three/fiber'
import { Html } from '@react-three/drei'
import * as THREE from 'three'
import type { NodeType } from '../../types/graph'

// Exact dashboard palette colors — readable on white background
const NODE_COLOR: Record<NodeType, string> = {
  company:  '#0a0a0a',  // ink
  team:     '#2b2b2b',  // graphite
  person:   '#3d3d3d',  // dark gray
  client:   '#b45309',  // amber.brain
  topic:    '#6b6b6b',  // stone
  task:     '#2b2b2b',  // graphite
  event:    '#4a4a4a',  // mid gray
  draft:    '#9a9a9a',  // light gray (secondary)
  agent:    '#0a0a0a',  // ink
  feature:  '#1d4ed8',  // blue.brain
  decision: '#854d0e',  // decision.fg
  alert:    '#d97706',  // amber (drift)
}

const NODE_RADIUS: Record<NodeType, number> = {
  company: 22,
  team: 14,
  person: 8,
  client: 7,
  topic: 6,
  task: 5,
  event: 5,
  draft: 5,
  agent: 7,
  feature: 6,
  decision: 6,
  alert: 8,
}

type Props = {
  id: string
  type: NodeType
  label: string
  x: number
  y: number
  z: number
  isFocused: boolean
  isSelected: boolean
  isDimmed: boolean
  isStale?: boolean
  onPointerOver: () => void
  onPointerOut: () => void
  onClick: (e: THREE.Event) => void
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

export function Node3D({ type, label, x, y, z, isFocused, isSelected, isDimmed, isStale, onPointerOver, onPointerOut, onClick }: Props) {
  const meshRef = useRef<THREE.Mesh>(null)
  const materialRef = useRef<THREE.MeshStandardMaterial>(null)
  const [hovered, setHovered] = useState(false)
  const targetScale = useRef(1)
  const reducedMotion = usePrefersReducedMotion()

  const r = NODE_RADIUS[type]
  const color = NODE_COLOR[type]
  const active = isFocused || isSelected
  const pulseAlert = type === 'alert' && !isStale && !reducedMotion

  targetScale.current = active ? 1.35 : isDimmed ? 0.85 : 1

  useFrame(({ clock }) => {
    if (meshRef.current) {
      meshRef.current.scale.setScalar(
        THREE.MathUtils.lerp(meshRef.current.scale.x, targetScale.current, 0.12)
      )
    }
    if (materialRef.current) {
      if (pulseAlert) {
        const t = (Math.sin(clock.getElapsedTime() * 2.2) + 1) / 2
        materialRef.current.emissiveIntensity = 0.05 + t * 0.07
      } else if (type === 'alert') {
        materialRef.current.emissiveIntensity = 0.08
      } else {
        materialRef.current.emissiveIntensity = isSelected ? 0.08 : 0
      }
    }
  })

  const showLabel = active || type === 'company' || type === 'team' || hovered

  return (
    <group position={[x, y, z]}>
      <mesh
        ref={meshRef}
        onPointerOver={(e) => { e.stopPropagation(); setHovered(true); onPointerOver() }}
        onPointerOut={(e) => { e.stopPropagation(); setHovered(false); onPointerOut() }}
        onClick={(e) => { e.stopPropagation(); onClick(e) }}
      >
        <sphereGeometry args={[r, 40, 40]} />
        <meshStandardMaterial
          ref={materialRef}
          color={color}
          emissive={color}
          emissiveIntensity={0}
          roughness={0.55}
          metalness={0}
          transparent
          opacity={isDimmed ? 0.05 : 1}
        />
      </mesh>

      {showLabel && (
        <Html
          center
          distanceFactor={340}
          style={{ pointerEvents: 'none', whiteSpace: 'nowrap' }}
          position={[0, r + 5, 0]}
        >
          <span style={{
            fontSize: 11,
            fontWeight: active ? 600 : 400,
            color: active ? '#0a0a0a' : '#6b6b6b',
            fontFamily: 'ui-monospace, "JetBrains Mono", monospace',
            letterSpacing: '0.04em',
          }}>
            {label.length > 22 ? label.slice(0, 20) + '…' : label}
          </span>
        </Html>
      )}
    </group>
  )
}
