import type { SimNode } from './simulation'

export type ClusterHalo = {
  teamId: string
  color: string
  cx: number
  cy: number
  r: number
}

export function computeClusterHalos(
  nodes: SimNode[],
  teamColors: Map<string, string>,
): ClusterHalo[] {
  const byTeam = new Map<string, SimNode[]>()
  for (const n of nodes) {
    if (!n.team_id || n.x == null || n.y == null) continue
    if (!byTeam.has(n.team_id)) byTeam.set(n.team_id, [])
    byTeam.get(n.team_id)!.push(n)
  }

  const halos: ClusterHalo[] = []
  for (const [teamId, members] of byTeam) {
    if (members.length < 2) continue
    const cx = members.reduce((s, n) => s + (n.x ?? 0), 0) / members.length
    const cy = members.reduce((s, n) => s + (n.y ?? 0), 0) / members.length
    const r = Math.max(
      60,
      Math.max(...members.map((n) => Math.hypot((n.x ?? cx) - cx, (n.y ?? cy) - cy))) + 50,
    )
    halos.push({ teamId, color: teamColors.get(teamId) ?? '#6b6b6b', cx, cy, r })
  }
  return halos
}
