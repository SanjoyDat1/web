import type { ReactNode } from 'react'

type Props = { children: ReactNode; className?: string }

export function FrostedCard({ children, className = '' }: Props) {
  return (
    <div className={`rounded-2xl border border-mist bg-white/95 backdrop-blur-sm shadow-[0_1px_24px_-8px_rgba(0,0,0,0.1)] ${className}`}>
      {children}
    </div>
  )
}
