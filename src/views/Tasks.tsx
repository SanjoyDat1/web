import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import type { Task } from '../types/graph'
import { tasksApi } from '../lib/api/endpoints'
import { StatusPill } from '../components/ui/StatusPill'
import { TopBar } from '../components/layout/TopBar'

export function Tasks() {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    tasksApi.list()
      .then(setTasks)
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [])

  const statusVariant = (t: Task) => {
    const s = t.status ?? 'pending'
    if (s === 'running') return 'running'
    if (s === 'completed') return 'completed'
    if (s === 'failed') return 'failed'
    return 'pending'
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-screen">
      <TopBar title="Tasks" subtitle="All action items" />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {loading && <p className="text-[13px] text-stone">Loading…</p>}
        {!loading && tasks.length === 0 && (
          <p className="text-[13px] text-stone">No tasks yet. Start a conversation to generate action items.</p>
        )}
        <div className="space-y-2 max-w-2xl">
          {tasks.map((task) => (
            <div key={task.id} className="flex items-start gap-4 px-4 py-3 rounded-xl border border-mist hover:border-graphite transition-colors bg-white">
              <div className="flex-1 min-w-0">
                <p className="text-[13.5px] font-medium text-ink truncate">{task.label}</p>
                {task.detail && <p className="text-[12px] text-stone mt-0.5 truncate">{task.detail}</p>}
              </div>
              <StatusPill label={statusVariant(task)} variant={statusVariant(task)} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
