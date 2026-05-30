import { useCallback, useRef, useState } from 'react'
import { useGraphStore } from '../../store/graphStore'
import { graphApi } from '../../lib/api/endpoints'

const MIN_DATE = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
const MAX_DATE = new Date()

function fromPercent(pct: number): Date {
  return new Date(MIN_DATE.getTime() + pct * (MAX_DATE.getTime() - MIN_DATE.getTime()))
}

export function TimelineScrubber() {
  const setTimelineAt = useGraphStore((s) => s.setTimelineAt)
  const setGraph = useGraphStore((s) => s.setGraph)
  const [position, setPosition] = useState(1) // 1 = live (rightmost)
  const [isLive, setIsLive] = useState(true)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const trackRef = useRef<HTMLDivElement>(null)

  const seekTo = useCallback(async (pct: number) => {
    const clamped = Math.max(0, Math.min(1, pct))
    setPosition(clamped)

    if (clamped >= 0.99) {
      setIsLive(true)
      setTimelineAt(null)
      // Reload live graph
      const data = await graphApi.company()
      setGraph(data.nodes, data.edges)
      return
    }

    setIsLive(false)
    const targetDate = fromPercent(clamped)
    setTimelineAt(targetDate.toISOString())

    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(async () => {
      try {
        const data = await graphApi.snapshot(targetDate.toISOString())
        setGraph(data.nodes, data.edges)
      } catch { /* keep current state */ }
    }, 300)
  }, [setTimelineAt, setGraph])

  function handleTrackClick(e: React.MouseEvent<HTMLDivElement>) {
    if (!trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    seekTo((e.clientX - rect.left) / rect.width)
  }

  const displayDate = isLive ? 'Live' : fromPercent(position).toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
  })

  return (
    <div className="flex items-center gap-3 px-4 py-3 bg-white border-t border-mist">
      <span className="text-[9.5px] uppercase tracking-[0.2em] text-stone w-16 shrink-0">Timeline</span>

      <div ref={trackRef} className="flex-1 relative h-1.5 bg-mist rounded-full cursor-pointer" onClick={handleTrackClick}>
        <div className="absolute left-0 top-0 h-full bg-ink rounded-full" style={{ width: `${position * 100}%` }} />
        <div
          className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-ink rounded-full border-2 border-white shadow-sm cursor-grab"
          style={{ left: `${position * 100}%`, transform: 'translate(-50%, -50%)' }}
        />
      </div>

      <span className={`text-[10.5px] tracking-wide shrink-0 ${isLive ? 'text-ink font-semibold' : 'text-stone'}`}>
        {displayDate}
      </span>

      {!isLive && (
        <button onClick={() => seekTo(1)} className="text-[10px] uppercase tracking-[0.16em] text-stone hover:text-ink transition-colors shrink-0">
          Live
        </button>
      )}
    </div>
  )
}
