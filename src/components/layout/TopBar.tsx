import { useGraphStore } from '../../store/graphStore'

type Props = { title: string; subtitle?: string }

export function TopBar({ title, subtitle }: Props) {
  const timelineAt = useGraphStore((s) => s.timelineAt)

  return (
    <div className="px-8 py-5 border-b border-mist flex items-baseline justify-between">
      <div>
        <div className="text-[9.5px] uppercase tracking-[0.22em] text-stone mb-0.5">
          {timelineAt ? `Viewing ${new Date(timelineAt).toLocaleDateString()}` : subtitle ?? 'Live'}
        </div>
        <h1 className="font-display font-bold text-[26px] tracking-tightest text-ink leading-none">{title}</h1>
      </div>
    </div>
  )
}
