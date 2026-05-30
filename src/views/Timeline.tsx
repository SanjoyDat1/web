import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { GraphCanvas } from '../components/graph/GraphCanvas'
import { NodeDetailPanel } from '../components/graph/NodeDetailPanel'
import { TimelineScrubber } from '../components/graph/TimelineScrubber'
import { TopBar } from '../components/layout/TopBar'
import { useGraphStore } from '../store/graphStore'
import { graphApi } from '../lib/api/endpoints'

export function Timeline() {
  const nodes = useGraphStore((s) => s.nodes)
  const edges = useGraphStore((s) => s.edges)
  const hiddenTypes = useGraphStore((s) => s.hiddenTypes)
  const selectedId = useGraphStore((s) => s.selectedId)
  const setSelected = useGraphStore((s) => s.setSelected)
  const setGraph = useGraphStore((s) => s.setGraph)

  useEffect(() => {
    graphApi.company().then((d) => setGraph(d.nodes, d.edges)).catch(console.error)
  }, [setGraph])

  return (
    <motion.div
      key="timeline"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="flex flex-col h-screen"
    >
      <TopBar title="Timeline" subtitle="Replay how the brain grew" />

      <div className="flex-1 relative mx-6 mt-4 rounded-2xl border border-mist overflow-hidden bg-white">
        <GraphCanvas
          nodes={Array.from(nodes.values())}
          edges={Array.from(edges.values())}
          hiddenTypes={hiddenTypes}
          searchQuery=""
          selectedId={selectedId}
          onSelect={setSelected}
        />
        <NodeDetailPanel selectedId={selectedId} onClose={() => setSelected(null)} />
      </div>

      <div className="mx-6 mb-6 rounded-b-2xl border-x border-b border-mist overflow-hidden">
        <TimelineScrubber />
      </div>
    </motion.div>
  )
}
