type Variant = 'pending' | 'running' | 'completed' | 'failed' | 'default'

const STYLES: Record<Variant, string> = {
  pending: 'bg-paper text-stone border-mist',
  running: 'bg-ink text-white border-ink',
  completed: 'bg-paper text-graphite border-mist',
  failed: 'bg-red-50 text-red-700 border-red-200',
  default: 'bg-paper text-stone border-mist',
}

type Props = { label: string; variant?: Variant }

export function StatusPill({ label, variant = 'default' }: Props) {
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-[10px] uppercase tracking-[0.16em] border ${STYLES[variant]}`}>
      {label}
    </span>
  )
}
