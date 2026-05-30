type Props = {
  label: string
  value: string | number
  sublabel?: string
}

export function StatCard({ label, value, sublabel }: Props) {
  return (
    <dl className="px-4 py-3 rounded-xl border border-mist bg-white">
      <dt className="text-[10px] uppercase tracking-[0.16em] text-stone">{label}</dt>
      <dd className="mt-1 font-display font-bold text-[24px] tracking-tightest text-ink leading-none">{value}</dd>
      {sublabel && <dd className="mt-1 text-[10.5px] text-stone">{sublabel}</dd>}
    </dl>
  )
}
