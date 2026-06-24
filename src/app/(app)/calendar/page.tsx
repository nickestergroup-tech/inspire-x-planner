'use client'

import { useState } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Action, Category } from '@/types'
import { ICON_MAP } from '@/components/categories/IconPicker'
import { toDateString, getWeekStart, formatMinutes } from '@/lib/dates'
import { Button } from '@/components/ui/button'

function CalendarDay({ date, actions, categories, isCurrentMonth }: {
  date: Date; actions: Action[]; categories: Record<string, Category>; isCurrentMonth: boolean
}) {
  const isToday = isSameDay(date, new Date())
  const totalMins = actions.reduce((s, a) => s + a.estimated_minutes, 0)

  return (
    <div className={`min-h-[100px] p-1.5 border-r border-b border-[#1f2d45] ${!isCurrentMonth ? 'opacity-30' : ''}`}>
      <div className={`text-xs font-bold mb-1 w-6 h-6 flex items-center justify-center rounded-full ${
        isToday ? 'bg-[#f97316] text-white' : 'text-[#94a3b8]'
      }`}>
        {format(date, 'd')}
      </div>
      {totalMins > 0 && (
        <div className="text-[10px] text-[#475569] flex items-center gap-0.5 mb-1">
          <Clock size={8} />
          {formatMinutes(totalMins)}
        </div>
      )}
      <div className="space-y-0.5">
        {actions.slice(0, 3).map((action) => {
          const cat = categories[action.category_id ?? '']
          return (
            <div
              key={action.id}
              className="text-[10px] px-1 py-0.5 rounded truncate"
              style={{ backgroundColor: (cat?.color ?? '#f97316') + '33', color: cat?.color ?? '#f97316' }}
            >
              {action.title}
            </div>
          )
        })}
        {actions.length > 3 && (
          <div className="text-[10px] text-[#475569] pl-1">+{actions.length - 3} more</div>
        )}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [actions, setActions] = useState<Action[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const supabase = createClient()

  async function load() {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const [catRes, actRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('actions').select('*')
        .gte('planned_date', toDateString(monthStart))
        .lte('planned_date', toDateString(monthEnd))
        .order('sort_order'),
    ])
    setCategories(catRes.data ?? [])
    setActions(actRes.data ?? [])
  }

  useEffect(() => { load() }, [currentMonth])

  const catMap: Record<string, Category> = {}
  for (const c of categories) catMap[c.id] = c

  // Build calendar grid (Mon-Sun weeks)
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let d = calStart
  while (d <= calEnd) { days.push(d); d = addDays(d, 1) }

  function getDayActions(day: Date) {
    return actions.filter((a) => a.planned_date === toDateString(day))
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Header */}
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-black tracking-widest uppercase text-white">Calendar</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <span className="text-white font-semibold text-sm min-w-[140px] text-center">
            {format(currentMonth, 'MMMM yyyy')}
          </span>
          <button
            onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
            className="w-8 h-8 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          <Button
            size="sm"
            onClick={() => setCurrentMonth(new Date())}
            className="h-7 px-3 text-xs bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white"
          >
            Today
          </Button>
        </div>
      </div>

      <div className="px-6 py-4">
        {/* Day headers */}
        <div className="grid grid-cols-7 border-l border-t border-[#1f2d45]">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
            <div key={day} className="px-2 py-2 text-xs font-black tracking-widest uppercase text-[#475569] text-center border-r border-b border-[#1f2d45] bg-[#111827]">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar grid */}
        <div className="grid grid-cols-7 border-l border-t border-[#1f2d45]">
          {days.map((day) => (
            <CalendarDay
              key={toDateString(day)}
              date={day}
              actions={getDayActions(day)}
              categories={catMap}
              isCurrentMonth={isSameMonth(day, currentMonth)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
