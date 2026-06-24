'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, ChevronDown, ChevronRight, Check, ExternalLink } from 'lucide-react'
import { Category, Action } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { WeekNavigator } from '@/components/layout/WeekNavigator'
import { ActionItem } from '@/components/actions/ActionItem'
import { ActionForm } from '@/components/actions/ActionForm'
import { ICON_MAP } from '@/components/categories/IconPicker'
import { Button } from '@/components/ui/button'
import { getWeekStart, toDateString } from '@/lib/dates'

interface CategoryCaptureCardProps {
  category: Category
  actions: Action[]
  weekStart: Date
  onActionUpdate: (action: Action) => void
  onActionDelete: (id: string) => void
  onAddAction: (categoryId: string) => void
  onActionEdit: (action: Action) => void
}

function CategoryCaptureCard({
  category, actions, onActionUpdate, onActionDelete, onAddAction, onActionEdit,
}: CategoryCaptureCardProps) {
  const [collapsed, setCollapsed] = useState(false)
  const [showCompleted, setShowCompleted] = useState(false)
  const Icon = ICON_MAP[category.icon] ?? ICON_MAP['list']
  const active = actions.filter((a) => !a.is_complete)
  const completed = actions.filter((a) => a.is_complete)

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2d45] overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1a2235] transition-colors"
        onClick={() => setCollapsed((v) => !v)}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category.color }}>
          <Icon size={14} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-white font-black tracking-widest uppercase text-xs">{category.name}</p>
          {category.ultimate_vision && (
            <p className="text-[#475569] text-xs truncate">{category.ultimate_vision}</p>
          )}
        </div>
        <span className="text-xs text-[#475569]">{active.length}</span>
        {collapsed ? <ChevronRight size={14} className="text-[#475569]" /> : <ChevronDown size={14} className="text-[#475569]" />}
      </div>

      {!collapsed && (
        <div className="px-4 pb-3">
          {active.length === 0 ? (
            <p className="text-[#475569] text-xs italic py-2">No current actions</p>
          ) : (
            <div className="space-y-0.5 mb-2">
              {active.map((action) => (
                <ActionItem key={action.id} action={action} accentColor={category.color}
                  onUpdate={onActionUpdate} onDelete={onActionDelete} onEdit={onActionEdit} />
              ))}
            </div>
          )}

          <button
            onClick={(e) => { e.stopPropagation(); onAddAction(category.id) }}
            className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#f97316] transition-colors mt-1"
          >
            <Plus size={12} /> Add action
          </button>

          {completed.length > 0 && (
            <div className="mt-2 border-t border-[#1f2d45] pt-2">
              <button
                onClick={() => setShowCompleted((v) => !v)}
                className="flex items-center gap-1 text-xs text-[#475569] hover:text-[#94a3b8]"
              >
                {showCompleted ? <ChevronDown size={11} /> : <ChevronRight size={11} />}
                {completed.length} completed
              </button>
              {showCompleted && (
                <div className="space-y-0.5 mt-1">
                  {completed.map((action) => (
                    <ActionItem key={action.id} action={action} accentColor={category.color}
                      onUpdate={onActionUpdate} onDelete={onActionDelete} onEdit={onActionEdit} />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function WeeklyCCapturePage() {
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [categories, setCategories] = useState<Category[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [actionFormOpen, setActionFormOpen] = useState(false)
  const [defaultCategoryId, setDefaultCategoryId] = useState<string | undefined>()
  const [editingAction, setEditingAction] = useState<Action | undefined>()

  const supabase = createClient()

  async function load() {
    setLoading(true)
    const [catRes, actRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('actions').select('*')
        .eq('week_start', toDateString(weekStart))
        .order('sort_order'),
    ])
    setCategories(catRes.data ?? [])
    setActions(actRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [weekStart])

  function getActionsForCategory(catId: string) {
    return actions.filter((a) => a.category_id === catId)
  }

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

  const captureCategory = categories.find((c) => c.is_system)
  const nonCapture = categories.filter((c) => !c.is_system && !c.is_archived)
  const emptyCategories = nonCapture.filter((c) => getActionsForCategory(c.id).length === 0)
  const activeCategories = nonCapture.filter((c) => getActionsForCategory(c.id).length > 0)

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Subheader */}
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-black tracking-widest uppercase text-white">Weekly Capture</h1>
        <div className="flex items-center gap-4">
          <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
          <Button size="sm" className="bg-[#22c55e] hover:bg-green-600 text-white h-7 px-3 text-xs gap-1">
            <Check size={12} /> Complete My Week
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-4">
        {/* Capture category */}
        {captureCategory && (
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-2">
              General Capture
            </p>
            <CategoryCaptureCard
              category={captureCategory}
              actions={getActionsForCategory(captureCategory.id)}
              weekStart={weekStart}
              onActionUpdate={handleActionUpdate}
              onActionDelete={handleActionDelete}
              onActionEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
              onAddAction={(catId) => { setDefaultCategoryId(catId); setEditingAction(undefined); setActionFormOpen(true) }}
            />
          </div>
        )}

        {/* Active categories */}
        {(activeCategories.length > 0 || loading) && (
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-2">
              Categories
            </p>
            {loading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[1,2,3,4].map((i) => <div key={i} className="h-24 rounded-xl bg-[#111827] animate-pulse" />)}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeCategories.map((cat) => (
                  <CategoryCaptureCard
                    key={cat.id}
                    category={cat}
                    actions={getActionsForCategory(cat.id)}
                    weekStart={weekStart}
                    onActionUpdate={handleActionUpdate}
                    onActionDelete={handleActionDelete}
                    onActionEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
                    onAddAction={(catId) => { setDefaultCategoryId(catId); setEditingAction(undefined); setActionFormOpen(true) }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Empty categories (collapsible) */}
        {emptyCategories.length > 0 && (
          <EmptyCategoriesSection
            categories={emptyCategories}
            weekStart={weekStart}
            onAdd={(catId) => { setDefaultCategoryId(catId); setEditingAction(undefined); setActionFormOpen(true) }}
          />
        )}

        {/* Spotlight CTA */}
        {nonCapture.length > 0 && (
          <div className="mt-8 flex justify-center">
            <Link
              href={`/spotlight/${nonCapture[0]?.id}`}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[#111827] border border-[#1f2d45] hover:border-[#f97316]/50 text-[#94a3b8] hover:text-white text-sm font-semibold tracking-widest uppercase transition-colors"
            >
              <ExternalLink size={14} />
              Open Category Spotlight
            </Link>
          </div>
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

function EmptyCategoriesSection({ categories, onAdd }: {
  categories: Category[]; weekStart: Date; onAdd: (catId: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [showCompleted] = useState(false)

  return (
    <div>
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#475569] hover:text-[#94a3b8] mb-3"
      >
        {open ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
        Empty Categories ({categories.length})
      </button>
      {open && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {categories.map((cat) => {
            const Icon = ICON_MAP[cat.icon] ?? ICON_MAP['list']
            return (
              <div key={cat.id} className="bg-[#111827] rounded-xl border border-[#1f2d45] p-4 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: cat.color }}>
                  <Icon size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white font-black tracking-widest uppercase text-xs">{cat.name}</p>
                  <p className="text-[#475569] text-xs italic">No current actions</p>
                </div>
                <button onClick={() => onAdd(cat.id)}
                  className="w-6 h-6 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#475569] hover:text-white flex items-center justify-center transition-colors">
                  <Plus size={12} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
