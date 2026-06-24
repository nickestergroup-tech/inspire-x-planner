'use client'

import { ChevronLeft, ChevronRight } from 'lucide-react'
import { formatWeekRange, prevWeek, nextWeek, getWeekStart, toDateString } from '@/lib/dates'
import { Button } from '@/components/ui/button'

interface WeekNavigatorProps {
  weekStart: Date
  onChange: (weekStart: Date) => void
}

export function WeekNavigator({ weekStart, onChange }: WeekNavigatorProps) {
  const isCurrentWeek = toDateString(weekStart) === toDateString(getWeekStart())

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => onChange(prevWeek(weekStart))}
        className="w-8 h-8 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
      >
        <ChevronLeft size={16} />
      </button>

      <span className="text-white font-semibold text-sm min-w-[180px] text-center">
        {formatWeekRange(weekStart)}
      </span>

      <button
        onClick={() => onChange(nextWeek(weekStart))}
        className="w-8 h-8 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
      >
        <ChevronRight size={16} />
      </button>

      {!isCurrentWeek && (
        <Button
          size="sm"
          onClick={() => onChange(getWeekStart())}
          className="h-7 px-3 text-xs bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white"
        >
          Current Week
        </Button>
      )}
    </div>
  )
}
