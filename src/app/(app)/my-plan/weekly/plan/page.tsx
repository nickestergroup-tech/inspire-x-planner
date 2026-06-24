'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, ChevronRight, Star, Clock, GripVertical } from 'lucide-react'
import { Category, Action } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { WeekNavigator } from '@/components/layout/WeekNavigator'
import { ActionCard } from '@/components/actions/ActionCard'
import { ICON_MAP } from '@/components/categories/IconPicker'
import { Button } from '@/components/ui/button'
import { getWeekStart, getWeekDays, toDateString, formatMinutes } from '@/lib/dates'
import { format } from 'date-fns'
import {
  DndContext, DragEndEvent, DragOverlay, DragStartEvent, PointerSensor, useSensor, useSensors,
} from '@dnd-kit/core'
import { useDroppable } from '@dnd-kit/core'

function DayColumn({
  day, actions, categories,
}: {
  day: Date; actions: Action[]; categories: Record<string, Category>
}) {
  const { setNodeRef, isOver } = useDroppable({ id: toDateString(day) })
  const starMins = actions.filter((a) => a.is_starred).reduce((s, a) => s + a.estimated_minutes, 0)
  const totalMins = actions.reduce((s, a) => s + a.estimated_minutes, 0)
  const isToday = toDateString(day) === toDateString(new Date())

  return (
    <div className="flex flex-col min-w-0">
      {/* Day header */}
      <div className={`text-center pb-2 mb-2 border-b ${isToday ? 'border-[#f97316]' : 'border-[#1f2d45]'}`}>
        <p className={`text-xs font-semibold tracking-widest uppercase ${isToday ? 'text-[#f97316]' : 'text-[#475569]'}`}>
          {format(day, 'EEE')}
        </p>
        <p className={`text-lg font-black ${isToday ? 'text-[#f97316]' : 'text-white'}`}>
          {format(day, 'd')}
        </p>
        <div className="flex items-center justify-center gap-2 text-xs text-[#475569] mt-1">
          <span className="flex items-center gap-0.5">
            <Star size={9} className="text-yellow-400" fill="currentColor" />
            {formatMinutes(starMins)}
          </span>
          <span className="flex items-center gap-0.5">
            <Clock size={9} />
            {formatMinutes(totalMins)}
          </span>
        </div>
      </div>

      {/* Drop zone */}
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-[200px] rounded-xl p-2 transition-colors space-y-1.5 ${
          isOver ? 'bg-[#f97316]/10 border border-[#f97316]/40' : 'bg-[#111827] border border-[#1f2d45]'
        }`}
      >
        {actions.length === 0 ? (
          <p className="text-[#475569] text-xs italic text-center mt-8">Drop here</p>
        ) : (
          actions.map((action) => (
            <ActionCard
              key={action.id}
              action={action}
              accentColor={categories[action.category_id ?? '']?.color ?? '#f97316'}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default function WeeklyPlanPage() {
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [categories, setCategories] = useState<Category[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [showAll, setShowAll] = useState(false)
  const [activeAction, setActiveAction] = useState<Action | null>(null)

  const supabase = createClient()
  const weekDays = getWeekDays(weekStart)
  const catMap: Record<string, Category> = {}
  for (const c of categories) catMap[c.id] = c

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }))

  async function load() {
    setLoading(true)
    const [catRes, actRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('actions').select('*').eq('week_start', toDateString(weekStart)).order('sort_order'),
    ])
    setCategories(catRes.data ?? [])
    setActions(actRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [weekStart])

  function getDayActions(day: Date) {
    return actions.filter((a) => a.planned_date === toDateString(day))
  }

  const unplanned = actions.filter((a) => !a.planned_date && !a.is_complete)
  const panelActions = showAll ? actions.filter((a) => !a.is_complete) : unplanned

  function handleDragStart(event: DragStartEvent) {
    const action = actions.find((a) => a.id === event.active.id)
    setActiveAction(action ?? null)
  }

  async function handleDragEnd(event: DragEndEvent) {
    setActiveAction(null)
    const { active, over } = event
    if (!over) return

    const actionId = active.id as string
    const dateStr = over.id as string

    setActions((prev) =>
      prev.map((a) => a.id === actionId ? { ...a, planned_date: dateStr } : a)
    )

    await supabase.from('actions').update({ planned_date: dateStr }).eq('id', actionId)
  }

  const nonCapture = categories.filter((c) => !c.is_system && !c.is_archived)

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Subheader */}
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-black tracking-widest uppercase text-white">Weekly Plan</h1>
        <div className="flex items-center gap-4">
          <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
          <Button size="sm" className="bg-[#22c55e] hover:bg-green-600 text-white h-7 px-3 text-xs gap-1">
            <Check size={12} /> Complete My Week
          </Button>
        </div>
      </div>

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <div className="flex h-[calc(100vh-7rem)]">
          {/* Left panel */}
          <div className="w-72 flex-shrink-0 border-r border-[#1f2d45] overflow-y-auto p-4 space-y-2">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#475569]">
                {showAll ? 'All Actions' : 'Unplanned'}
              </span>
              <button
                onClick={() => setShowAll((v) => !v)}
                className="text-xs text-[#475569] hover:text-[#f97316] transition-colors"
              >
                {showAll ? 'Show Unplanned' : 'Show All'}
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => <div key={i} className="h-8 rounded-lg bg-[#111827] animate-pulse" />)}
              </div>
            ) : (
              nonCapture.map((cat) => {
                const catActions = panelActions.filter((a) => a.category_id === cat.id)
                if (catActions.length === 0) return null
                const Icon = ICON_MAP[cat.icon] ?? ICON_MAP['list']
                return (
                  <div key={cat.id} className="mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <div className="w-5 h-5 rounded flex items-center justify-center flex-shrink-0" style={{ backgroundColor: cat.color }}>
                        <Icon size={11} className="text-white" />
                      </div>
                      <span className="text-xs font-black tracking-widest uppercase text-white">{cat.name}</span>
                    </div>
                    <div className="space-y-1 pl-1">
                      {catActions.map((action) => (
                        <ActionCard key={action.id} action={action} accentColor={cat.color} />
                      ))}
                    </div>
                  </div>
                )
              })
            )}

            {!loading && panelActions.length === 0 && (
              <p className="text-[#475569] text-xs italic text-center py-8">
                {showAll ? 'No actions for this week' : 'All actions planned! 🎉'}
              </p>
            )}
          </div>

          {/* Right: 7-day grid */}
          <div className="flex-1 overflow-x-auto">
            <div className="grid grid-cols-7 gap-2 p-4 min-w-[700px] h-full">
              {weekDays.map((day) => (
                <DayColumn
                  key={toDateString(day)}
                  day={day}
                  actions={getDayActions(day)}
                  categories={catMap}
                />
              ))}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeAction && (
            <div className="px-2 py-1.5 rounded-lg bg-[#1a2235] border border-[#f97316] shadow-xl opacity-90">
              <span className="text-white text-xs">{activeAction.title}</span>
            </div>
          )}
        </DragOverlay>
      </DndContext>
    </div>
  )
}
