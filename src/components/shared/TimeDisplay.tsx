import { formatMinutes } from '@/lib/dates'
import { Star, Clock } from 'lucide-react'

interface TimeDisplayProps {
  starredMinutes: number
  totalMinutes: number
  size?: 'sm' | 'md'
}

export function TimeDisplay({ starredMinutes, totalMinutes, size = 'sm' }: TimeDisplayProps) {
  const cls = size === 'sm' ? 'text-xs' : 'text-sm'
  return (
    <div className={`flex items-center gap-3 ${cls} text-[#94a3b8]`}>
      <span className="flex items-center gap-1">
        <Star size={size === 'sm' ? 11 : 13} className="text-yellow-400" fill="currentColor" />
        {formatMinutes(starredMinutes)}
      </span>
      <span className="flex items-center gap-1">
        <Clock size={size === 'sm' ? 11 : 13} />
        {formatMinutes(totalMinutes)}
      </span>
    </div>
  )
}
