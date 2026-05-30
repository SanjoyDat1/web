import type { ClusterHalo as ClusterHaloData } from '../../lib/graph/layout'

type Props = { halos: ClusterHaloData[] }

export function ClusterHalos({ halos }: Props) {
  return (
    <g>
      {halos.map((h) => (
        <ClusterHalo key={h.teamId} halo={h} />
      ))}
    </g>
  )
}

function ClusterHalo({ halo }: { halo: ClusterHaloData }) {
  const gradId = `halo-${halo.teamId}`
  return (
    <g>
      <defs>
        <radialGradient id={gradId} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={halo.color} stopOpacity={0.08} />
          <stop offset="70%" stopColor={halo.color} stopOpacity={0.04} />
          <stop offset="100%" stopColor={halo.color} stopOpacity={0} />
        </radialGradient>
      </defs>
      <circle
        cx={halo.cx}
        cy={halo.cy}
        r={halo.r}
        fill={`url(#${gradId})`}
        stroke={halo.color}
        strokeWidth={1}
        strokeOpacity={0.1}
        style={{ pointerEvents: 'none', transition: 'cx 200ms, cy 200ms, r 200ms' }}
      />
    </g>
  )
}
