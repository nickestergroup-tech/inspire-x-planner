'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addDays, isSameMonth, isSameDay, addMonths, subMonths } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { Action, Category, NylasEvent } from '@/types'
import { toDateString, formatMinutes } from '@/lib/dates'
import { Button } from '@/components/ui/button'

function getEventDate(when: NylasEvent['when']): string | null {
  if ('start_time' in when) return format(new Date(when.start_time * 1000), 'yyyy-MM-dd')
  if ('date' in when) return when.date
  if ('start_date' in when) return when.start_date
  return null
}

function CalendarDay({
  date, actions, nylasEvents, categories, isCurrentMonth,
}: {
  date: Date
  actions: Action[]
  nylasEvents: NylasEvent[]
  categories: Record<string, Category>
  isCurrentMonth: boolean
}) {
  const isToday = isSameDay(date, new Date())
  const totalMins = actions.reduce((s, a) => s + a.estimated_minutes, 0)

  return (
    <div className={`min-h-[110px] p-1.5 border-r border-b border-[#1f2d45] ${!isCurrentMonth ? 'opacity-30' : ''}`}>
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
        {nylasEvents.slice(0, 2).map((ev) => (
          <div
            key={ev.id}
            className="text-[10px] px-1 py-0.5 rounded truncate bg-[#1e3a5f] text-[#60a5fa]"
          >
            {ev.title}
          </div>
        ))}
        {nylasEvents.length > 2 && (
          <div className="text-[10px] text-[#475569] pl-1">+{nylasEvents.length - 2} cal</div>
        )}
      </div>
    </div>
  )
}

export default function CalendarPage() {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [actions, setActions] = useState<Action[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [nylasEvents, setNylasEvents] = useState<NylasEvent[]>([])
  const [hasCalendar, setHasCalendar] = useState(false)
  const supabase = createClient()

  async function load() {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const [catRes, actRes, connRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('actions').select('*')
        .gte('planned_date', toDateString(monthStart))
        .lte('planned_date', toDateString(monthEnd))
        .order('sort_order'),
      supabase.from('calendar_connections').select('grant_id').eq('is_active', true).single(),
    ])
    setCategories(catRes.data ?? [])
    setActions(actRes.data ?? [])

    if (connRes.data?.grant_id) {
      setHasCalendar(true)
      // Fetch Nylas events for the month
      const evRes = await fetch(
        `/api/calendar/nylas/events?start=${monthStart.toISOString()}&end=${monthEnd.toISOString()}`
      )
      if (evRes.ok) {
        const evData = await evRes.json()
        setNylasEvents(evData.events ?? [])
      }
    } else {
      setHasCalendar(false)
      setNylasEvents([])
    }
  }

  useEffect(() => { load() }, [currentMonth])

  const catMap: Record<string, Category> = {}
  for (const c of categories) catMap[c.id] = c

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

  function getDayNylasEvents(day: Date) {
    const dateStr = toDateString(day)
    return nylasEvents.filter((ev) => getEventDate(ev.when) === dateStr)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-sm font-black tracking-widest uppercase text-white">Calendar</h1>
          {hasCalendar && (
            <div className="flex items-center gap-1.5 text-xs text-emerald-400">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Synced
            </div>
          )}
        </div>
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
        {/* Legend */}
        {hasCalendar && (
          <div className="flex items-center gap-4 mb-3 text-[10px] text-[#475569]">
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded bg-[#f97316]/30" />
              <span>App actions</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-3 h-2 rounded bg-[#1e3a5f]" />
              <span>Calendar events</span>
            </div>
          </div>
        )}

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
              nylasEvents={getDayNylasEvents(day)}
              categories={catMap}
              isCurrentMonth={isSameMonth(day, currentMonth)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
