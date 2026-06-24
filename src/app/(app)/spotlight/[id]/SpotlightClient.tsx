'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, X, Plus, Star, Clock, Check, Target, Zap, Users } from 'lucide-react'
import { Category, Action, Project, GoalHorizon } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { ICON_MAP } from '@/components/categories/IconPicker'
import { ActionItem } from '@/components/actions/ActionItem'
import { ActionForm } from '@/components/actions/ActionForm'
import { getWeekStart, toDateString, formatMinutes } from '@/lib/dates'

interface SpotlightClientProps {
  category: Category
  allCategories: Category[]
}

export function SpotlightClient({ category, allCategories }: SpotlightClientProps) {
  const router = useRouter()
  const [actions, setActions] = useState<Action[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [horizons, setHorizons] = useState<GoalHorizon[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'vision' | 'actions' | 'projects'>('vision')
  const [actionFormOpen, setActionFormOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<Action | undefined>()

  const supabase = createClient()

  const nonSystem = allCategories.filter((c) => !c.is_system)
  const currentIdx = nonSystem.findIndex((c) => c.id === category.id)
  const prevCat = currentIdx > 0 ? nonSystem[currentIdx - 1] : null
  const nextCat = currentIdx < nonSystem.length - 1 ? nonSystem[currentIdx + 1] : null

  const Icon = ICON_MAP[category.icon] ?? ICON_MAP['list']

  async function load() {
    setLoading(true)
    const weekStartStr = toDateString(getWeekStart())
    const [actRes, projRes, horizRes] = await Promise.all([
      supabase.from('actions').select('*').eq('category_id', category.id).eq('week_start', weekStartStr).order('sort_order'),
      supabase.from('projects').select('*').eq('category_id', category.id).eq('is_archived', false).order('created_at'),
      supabase.from('goal_horizons').select('*, micro_goals(*)').eq('category_id', category.id).order('sort_order'),
    ])
    setActions(actRes.data ?? [])
    setProjects(projRes.data ?? [])
    setHorizons(horizRes.data ?? [])
    setLoading(false)
  }

  useEffect(() => { load() }, [category.id])

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

  const activeActions = actions.filter((a) => !a.is_complete)
  const completedActions = actions.filter((a) => a.is_complete)
  const starredMins = activeActions.filter((a) => a.is_starred).reduce((s, a) => s + a.estimated_minutes, 0)
  const totalMins = activeActions.reduce((s, a) => s + a.estimated_minutes, 0)

  const bgStyle = category.cover_image_url
    ? { backgroundImage: `url(${category.cover_image_url})`, backgroundSize: 'cover', backgroundPosition: 'center' }
    : { backgroundColor: category.color }

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f1a] flex flex-col">
      {/* Hero section */}
      <div className="relative flex-shrink-0" style={{ height: '240px', ...bgStyle }}>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/20 to-[#0a0f1a]" />

        {/* Top bar */}
        <div className="relative z-10 flex items-center justify-between px-6 pt-4">
          <Link href="/my-plan/weekly/capture" className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold tracking-widest uppercase">
            <X size={14} /> Close
          </Link>
          <div className="flex items-center gap-2">
            {prevCat && (
              <button
                onClick={() => router.push(`/spotlight/${prevCat.id}`)}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold tracking-widest uppercase"
              >
                <ChevronLeft size={14} /> Prev
              </button>
            )}
            <span className="text-white/40 text-xs px-2">
              {currentIdx + 1} / {nonSystem.length}
            </span>
            {nextCat && (
              <button
                onClick={() => router.push(`/spotlight/${nextCat.id}`)}
                className="flex items-center gap-1.5 text-white/70 hover:text-white text-xs font-semibold tracking-widest uppercase"
              >
                Next <ChevronRight size={14} />
              </button>
            )}
          </div>
        </div>

        {/* Category identity */}
        <div className="relative z-10 px-6 pb-4 absolute bottom-0 left-0 right-0">
          <div className="flex items-end gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center shadow-2xl" style={{ backgroundColor: category.color }}>
              <Icon size={26} className="text-white" />
            </div>
            <div>
              <p className="text-white/60 text-xs font-semibold tracking-widest uppercase mb-0.5">Category Spotlight</p>
              <h1 className="text-3xl font-black text-white tracking-tight">{category.name}</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Stats bar */}
      <div className="flex-shrink-0 bg-[#111827] border-b border-[#1f2d45] px-6 py-2">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
            <Star size={13} className="text-yellow-400" fill="currentColor" />
            {formatMinutes(starredMins)}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
            <Clock size={13} />
            {formatMinutes(totalMins)}
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
            <Check size={13} className="text-[#22c55e]" />
            {completedActions.length} done
          </div>
          <div className="flex items-center gap-1.5 text-sm text-[#94a3b8]">
            <Target size={13} />
            {projects.length} projects
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex-shrink-0 flex border-b border-[#1f2d45] bg-[#0a0f1a]">
        {([
          { key: 'vision', label: 'Big Picture', Icon: Zap },
          { key: 'actions', label: 'Actions', Icon: Check },
          { key: 'projects', label: 'Projects', Icon: Target },
        ] as const).map(({ key, label, Icon: TabIcon }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={`flex items-center gap-2 px-6 py-3 text-xs font-black tracking-widest uppercase border-b-2 transition-colors ${
              activeTab === key
                ? 'border-[#f97316] text-[#f97316]'
                : 'border-transparent text-[#475569] hover:text-[#94a3b8]'
            }`}
          >
            <TabIcon size={12} />
            {label}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {activeTab === 'vision' && (
          <div className="max-w-3xl mx-auto px-6 py-6 space-y-6">
            {category.ultimate_vision && (
              <section>
                <h3 className="text-xs font-black tracking-widest uppercase text-[#f97316] mb-2">Ultimate Vision</h3>
                <p className="text-white leading-relaxed">{category.ultimate_vision}</p>
              </section>
            )}
            {category.ultimate_purpose && (
              <section>
                <h3 className="text-xs font-black tracking-widest uppercase text-[#f97316] mb-2">Purpose / Why</h3>
                <p className="text-white leading-relaxed">{category.ultimate_purpose}</p>
              </section>
            )}
            {category.my_roles && (
              <section>
                <h3 className="text-xs font-black tracking-widest uppercase text-[#f97316] mb-2">My Roles</h3>
                <p className="text-white leading-relaxed">{category.my_roles}</p>
              </section>
            )}
            {horizons.length > 0 && (
              <section>
                <h3 className="text-xs font-black tracking-widest uppercase text-[#f97316] mb-4">Goal Horizons</h3>
                <div className="grid grid-cols-1 gap-4">
                  {horizons.map((horizon: any) => (
                    <div key={horizon.id} className="bg-[#111827] border border-[#1f2d45] rounded-xl p-4">
                      <h4 className="text-sm font-black text-white mb-2">{horizon.name}</h4>
                      {horizon.vision && <p className="text-[#94a3b8] text-sm mb-3">{horizon.vision}</p>}
                      {horizon.micro_goals?.length > 0 && (
                        <ul className="space-y-1">
                          {horizon.micro_goals.map((mg: any) => (
                            <li key={mg.id} className="flex items-start gap-2 text-sm text-[#94a3b8]">
                              <div className="w-1.5 h-1.5 rounded-full mt-2 flex-shrink-0" style={{ backgroundColor: category.color }} />
                              {mg.text}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
            {!category.ultimate_vision && !category.ultimate_purpose && horizons.length === 0 && (
              <div className="text-center py-12">
                <p className="text-[#475569] italic">No Big Picture content yet.</p>
                <Link
                  href={`/categories/${category.id}`}
                  className="mt-3 inline-block text-xs text-[#f97316] hover:underline tracking-widest uppercase font-semibold"
                >
                  Add Big Picture →
                </Link>
              </div>
            )}
          </div>
        )}

        {activeTab === 'actions' && (
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black tracking-widest uppercase text-white">This Week's Actions</h3>
              <button
                onClick={() => { setEditingAction(undefined); setActionFormOpen(true) }}
                className="flex items-center gap-1.5 text-xs text-[#475569] hover:text-[#f97316] transition-colors"
              >
                <Plus size={12} /> Add action
              </button>
            </div>

            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => <div key={i} className="h-10 rounded-xl bg-[#111827] animate-pulse" />)}
              </div>
            ) : activeActions.length === 0 && completedActions.length === 0 ? (
              <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-8 text-center">
                <p className="text-[#475569] italic mb-3">No actions this week</p>
                <button
                  onClick={() => { setEditingAction(undefined); setActionFormOpen(true) }}
                  className="text-xs text-[#f97316] hover:underline"
                >
                  + Add an action
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeActions.length > 0 && (
                  <div className="bg-[#111827] border border-[#1f2d45] rounded-xl divide-y divide-[#1f2d45] overflow-hidden">
                    {activeActions.map((action) => (
                      <div key={action.id} className="px-2">
                        <ActionItem
                          action={action}
                          accentColor={category.color}
                          onUpdate={handleActionUpdate}
                          onDelete={handleActionDelete}
                          onEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
                        />
                      </div>
                    ))}
                  </div>
                )}
                {completedActions.length > 0 && (
                  <div className="bg-[#111827] border border-[#1f2d45] rounded-xl divide-y divide-[#1f2d45] overflow-hidden opacity-60">
                    {completedActions.map((action) => (
                      <div key={action.id} className="px-2">
                        <ActionItem
                          action={action}
                          accentColor={category.color}
                          onUpdate={handleActionUpdate}
                          onDelete={handleActionDelete}
                          onEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'projects' && (
          <div className="max-w-3xl mx-auto px-6 py-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black tracking-widest uppercase text-white">Projects</h3>
              <Link
                href="/projects"
                className="text-xs text-[#475569] hover:text-[#f97316] tracking-widest uppercase font-semibold"
              >
                + New Project
              </Link>
            </div>
            {loading ? (
              <div className="space-y-2">
                {[1,2].map((i) => <div key={i} className="h-20 rounded-xl bg-[#111827] animate-pulse" />)}
              </div>
            ) : projects.length === 0 ? (
              <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-8 text-center">
                <p className="text-[#475569] italic">No projects yet</p>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Link key={project.id} href={`/projects/${project.id}`}
                    className="block bg-[#111827] border border-[#1f2d45] rounded-xl p-4 hover:border-[#f97316]/40 transition-colors">
                    <h4 className="text-white font-bold text-sm mb-1">{project.name}</h4>
                    {project.ultimate_result && (
                      <p className="text-[#475569] text-xs line-clamp-2">{project.ultimate_result}</p>
                    )}
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <ActionForm
        open={actionFormOpen}
        onClose={() => { setActionFormOpen(false); setEditingAction(undefined) }}
        onSave={handleActionSaved}
        initial={editingAction}
        defaultCategoryId={category.id}
      />
    </div>
  )
}
