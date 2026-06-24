'use client'

import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Plus, Check, Clock, Star } from 'lucide-react'
import { Category, Action } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { ActionItem } from '@/components/actions/ActionItem'
import { ActionForm } from '@/components/actions/ActionForm'
import { ICON_MAP } from '@/components/categories/IconPicker'
import { Button } from '@/components/ui/button'
import { getWeekStart, toDateString, formatMinutes } from '@/lib/dates'
import { format, addDays, subDays } from 'date-fns'

export default function DailyPlanPage() {
  const [selectedDay, setSelectedDay] = useState(new Date())
  const [categories, setCategories] = useState<Category[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFormOpen, setActionFormOpen] = useState(false)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>()
  const [editingAction, setEditingAction] = useState<Action | undefined>()

  const supabase = createClient()
  const isToday = toDateString(selectedDay) === toDateString(new Date())

  async function load() {
    setLoading(true)
    const dayStr = toDateString(selectedDay)
    const weekStartStr = toDateString(getWeekStart(selectedDay))
    const [catRes, actRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('actions').select('*')
        .eq('week_start', weekStartStr)
        .order('sort_order'),
    ])
    setCategories(catRes.data ?? [])
    // Show actions planned for this day OR unplanned actions for this week
    const all = actRes.data ?? []
    setActions(all.filter((a) => a.planned_date === dayStr || (!a.planned_date && !a.is_complete)))
    setLoading(false)
  }

  useEffect(() => { load() }, [selectedDay])

  function handleActionUpdate(action: Action) {
    setActions((prev) => prev.map((a) => a.id === action.id ? action : a))
  }
  function handleActionDelete(id: string) {
    setActions((prev) => prev.filter((a) => a.id !== id))
  }
  function handleActionSaved(action: Action) {
    setActions((prev) => {
      const idx = prev.findIndex((a) => a.id === action.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = action; return next }
      return [...prev, action]
    })
  }

  const catMap: Record<string, Category> = {}
  for (const c of categories) catMap[c.id] = c

  const dayStr = toDateString(selectedDay)
  const planned = actions.filter((a) => a.planned_date === dayStr && !a.is_complete)
  const unplanned = actions.filter((a) => !a.planned_date && !a.is_complete)
  const completed = actions.filter((a) => a.is_complete)

  const starredMins = planned.filter((a) => a.is_starred).reduce((s, a) => s + a.estimated_minutes, 0)
  const totalMins = planned.reduce((s, a) => s + a.estimated_minutes, 0)

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Subheader */}
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-black tracking-widest uppercase text-white">My Day</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSelectedDay(subDays(selectedDay, 1))}
            className="w-8 h-8 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronLeft size={16} />
          </button>
          <div className="text-center min-w-[140px]">
            <p className={`text-sm font-black tracking-widest uppercase ${isToday ? 'text-[#f97316]' : 'text-white'}`}>
              {format(selectedDay, 'EEEE')}
            </p>
            <p className="text-xs text-[#475569]">{format(selectedDay, 'MMM d, yyyy')}</p>
          </div>
          <button
            onClick={() => setSelectedDay(addDays(selectedDay, 1))}
            className="w-8 h-8 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
          >
            <ChevronRight size={16} />
          </button>
          {!isToday && (
            <Button
              size="sm"
              onClick={() => setSelectedDay(new Date())}
              className="h-7 px-3 text-xs bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white"
            >
              Today
            </Button>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 py-6 space-y-5">
        {/* Day stats */}
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <Star size={13} className="text-yellow-400" fill="currentColor" />
            <span>{formatMinutes(starredMins)} starred</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <Clock size={13} />
            <span>{formatMinutes(totalMins)} planned</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#94a3b8]">
            <Check size={13} className="text-[#22c55e]" />
            <span>{completed.length} done</span>
          </div>
        </div>

        {/* Planned for today */}
        <section>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-black tracking-widest uppercase text-white">
              Planned for {isToday ? 'Today' : format(selectedDay, 'EEEE')}
            </h2>
            <button
              onClick={() => { setDefaultCategoryId(undefined); setEditingAction(undefined); setActionFormOpen(true) }}
              className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#f97316] transition-colors"
            >
              <Plus size={12} /> Add action
            </button>
          </div>

          {loading ? (
            <div className="space-y-2">
              {[1,2,3].map((i) => <div key={i} className="h-10 rounded-xl bg-[#111827] animate-pulse" />)}
            </div>
          ) : planned.length === 0 ? (
            <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-6 text-center">
              <p className="text-[#475569] text-sm italic">Nothing planned for this day yet</p>
              <button
                onClick={() => { setDefaultCategoryId(undefined); setEditingAction(undefined); setActionFormOpen(true) }}
                className="mt-3 text-xs text-[#f97316] hover:underline"
              >
                + Add an action
              </button>
            </div>
          ) : (
            <div className="bg-[#111827] border border-[#1f2d45] rounded-xl divide-y divide-[#1f2d45] overflow-hidden">
              {planned.map((action) => {
                const cat = catMap[action.category_id ?? '']
                return (
                  <div key={action.id} className="px-2">
                    <ActionItem
                      action={action}
                      accentColor={cat?.color ?? '#f97316'}
                      onUpdate={handleActionUpdate}
                      onDelete={handleActionDelete}
                      onEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
                    />
                  </div>
                )
              })}
            </div>
          )}
        </section>

        {/* Unplanned this week */}
        {unplanned.length > 0 && (
          <section>
            <h2 className="text-xs font-black tracking-widest uppercase text-[#475569] mb-3">
              Unplanned This Week
            </h2>
            <div className="bg-[#111827] border border-[#1f2d45] rounded-xl divide-y divide-[#1f2d45] overflow-hidden opacity-70">
              {unplanned.map((action) => {
                const cat = catMap[action.category_id ?? '']
                return (
                  <div key={action.id} className="px-2">
                    <ActionItem
                      action={action}
                      accentColor={cat?.color ?? '#f97316'}
                      onUpdate={handleActionUpdate}
                      onDelete={handleActionDelete}
                      onEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )}

        {/* Completed */}
        {completed.length > 0 && (
          <section>
            <h2 className="text-xs font-black tracking-widest uppercase text-[#22c55e] mb-3">
              Completed ({completed.length})
            </h2>
            <div className="bg-[#111827] border border-[#1f2d45] rounded-xl divide-y divide-[#1f2d45] overflow-hidden">
              {completed.map((action) => {
                const cat = catMap[action.category_id ?? '']
                return (
                  <div key={action.id} className="px-2">
                    <ActionItem
                      action={action}
                      accentColor={cat?.color ?? '#f97316'}
                      onUpdate={handleActionUpdate}
                      onDelete={handleActionDelete}
                      onEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
                    />
                  </div>
                )
              })}
            </div>
          </section>
        )}
      </div>

      <ActionForm
        open={actionFormOpen}
        onClose={() => { setActionFormOpen(false); setDefaultCategoryId(undefined); setEditingAction(undefined) }}
        onSave={handleActionSaved}
        initial={editingAction}
        defaultCategoryId={defaultCategoryId}
      />
    </div>
  )
}
