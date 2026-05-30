import type { NodeType } from './graph'

export type IngestionSource = 'penlo_audio' | 'slack' | 'crm' | 'mcp_standup' | 'google_workspace'

export type ExtractedEntity = {
  label: string
  type: NodeType
  confidence: number
  properties: Record<string, unknown>
  related_to?: string[]
}

export type IngestionEvent = {
  id: string
  source: IngestionSource
  company_id: string
  user_id: string
  raw_content: string
  extracted_entities: ExtractedEntity[]
  confidence: number
  processed_at: string
  graph_updates: {
    created_node_ids: string[]
    created_edge_ids: string[]
    merged_node_ids: string[]
  }
}
