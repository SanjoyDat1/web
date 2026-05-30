import { useState } from 'react'
import { motion } from 'framer-motion'
import { useGraphStore } from '../store/graphStore'
import { useAuthStore } from '../store/authStore'
import { TopBar } from '../components/layout/TopBar'
import { OnboardingBriefModal } from '../components/admin/OnboardingBriefModal'

export function Drafts() {
  const nodes = useGraphStore((s) => s.nodes)
  const setSelected = useGraphStore((s) => s.setSelected)
  const user = useAuthStore((s) => s.user)
  const drafts = Array.from(nodes.values()).filter((n) => n.type === 'draft')
  const isAdmin = user?.role === 'admin'
  const [modalOpen, setModalOpen] = useState(false)

  function handleGenerated(draftNodeId: string) {
    setSelected(draftNodeId)
    setTimeout(() => {
      const el = document.getElementById(`draft-${draftNodeId}`)
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' })
    }, 150)
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex flex-col h-screen">
      <TopBar title="Drafts" subtitle="Pending communications" />
      <div className="flex-1 overflow-y-auto px-8 py-6">
        {isAdmin && (
          <div className="max-w-2xl mb-4 flex justify-end">
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-ink text-white text-[11px] uppercase tracking-[0.16em] hover:opacity-90 transition-opacity"
            >
              + Onboarding Brief
            </button>
          </div>
        )}
        {drafts.length === 0 && (
          <p className="text-[13px] text-stone">No drafts yet.</p>
        )}
        <div className="space-y-2 max-w-2xl">
          {drafts.map((d) => (
            <div
              key={d.id}
              id={`draft-${d.id}`}
              className="px-4 py-3 rounded-xl border border-mist bg-white hover:border-graphite transition-colors"
            >
              <p className="text-[13.5px] font-medium text-ink">{d.label}</p>
              {d.detail && <p className="text-[12px] text-stone mt-0.5 whitespace-pre-wrap">{d.detail}</p>}
              {d.meta && <p className="text-[10.5px] uppercase tracking-[0.16em] text-stone mt-1.5">{d.meta}</p>}
            </div>
          ))}
        </div>
      </div>
      {isAdmin && (
        <OnboardingBriefModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onGenerated={handleGenerated}
        />
      )}
    </motion.div>
  )
}
