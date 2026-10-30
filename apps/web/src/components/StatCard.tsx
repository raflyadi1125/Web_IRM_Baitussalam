import type { LucideIcon } from 'lucide-react'
import { ArrowDownRight, ArrowUpRight } from 'lucide-react'

interface StatCardProps {
  label: string
  value: string
  note: string
  trend?: string
  trendDirection?: 'up' | 'down'
  icon: LucideIcon
  iconTone: 'mint' | 'blue' | 'gold' | 'purple'
}

export default function StatCard({ label, value, note, trend, trendDirection = 'up', icon: Icon, iconTone }: StatCardProps) {
  const TrendIcon = trendDirection === 'up' ? ArrowUpRight : ArrowDownRight
  return (
    <article className="stat-card">
      <div className="stat-card-top">
        <span className="stat-label">{label}</span>
        <span className={`stat-icon stat-icon-${iconTone}`}><Icon size={19} strokeWidth={2} /></span>
      </div>
      <div className="stat-value-row"><strong className="stat-value">{value}</strong>{trend && <span className={`stat-trend ${trendDirection === 'up' ? 'trend-up' : 'trend-down'}`}><TrendIcon size={14} />{trend}</span>}</div>
      <p className="stat-note">{note}</p>
    </article>
  )
}
