import { useEffect, useRef } from 'react'
import type { SimLink, SimNode } from '../../lib/graph/simulation'

type Props = {
  links: SimLink[]
  focusedIds: Set<string> | null
  newEdgeIds: Set<string>
}

export function EdgeRenderer({ links, focusedIds, newEdgeIds }: Props) {
  return (
    <g>
      {links.map((l, i) => {
        const s = l.source as SimNode
        const t = l.target as SimNode
        if (s.x == null || t.x == null) return null

        const isFocusEdge = focusedIds
          ? focusedIds.has(s.id) && focusedIds.has(t.id)
          : true
        const isNew = newEdgeIds.has(l.id)

        return (
          <AnimatedEdge
            key={l.id ?? i}
            x1={s.x!}
            y1={s.y!}
            x2={t.x!}
            y2={t.y!}
            dim={!isFocusEdge}
            isNew={isNew}
          />
        )
      })}
    </g>
  )
}

type EdgeProps = {
  x1: number; y1: number; x2: number; y2: number
  dim: boolean; isNew: boolean
}

function AnimatedEdge({ x1, y1, x2, y2, dim, isNew }: EdgeProps) {
  const lineRef = useRef<SVGLineElement>(null)

  useEffect(() => {
    if (!isNew || !lineRef.current) return
    const len = Math.hypot(x2 - x1, y2 - y1)
    const line = lineRef.current
    line.style.strokeDasharray = String(len)
    line.style.strokeDashoffset = String(len)
    // Animate dash offset to 0 over 600ms
    requestAnimationFrame(() => {
      line.style.transition = 'stroke-dashoffset 600ms ease-out'
      line.style.strokeDashoffset = '0'
    })
  }, [isNew, x1, y1, x2, y2])

  return (
    <line
      ref={lineRef}
      x1={x1} y1={y1} x2={x2} y2={y2}
      stroke={dim ? '#e6e6e6' : '#cfcfcf'}
      strokeOpacity={dim ? 0.3 : 0.8}
      strokeWidth={dim ? 0.6 : 0.85}
      style={{ transition: 'stroke 200ms, stroke-opacity 200ms' }}
    />
  )
}
