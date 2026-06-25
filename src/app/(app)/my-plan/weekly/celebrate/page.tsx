'use client'

import { useState, useEffect } from 'react'
import { Check, ChevronDown, ChevronRight, Star, Clock, Sparkles } from 'lucide-react'
import { Category, Action } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { WeekNavigator } from '@/components/layout/WeekNavigator'
import { ICON_MAP } from '@/components/categories/IconPicker'
import { Button } from '@/components/ui/button'
import { getWeekStart, toDateString, formatMinutes } from '@/lib/dates'

interface CategoryBreakdown {
  category: Category
  completed: Action[]
  incomplete: Action[]
}

export default function WeeklyReflectionPage() {
  const [weekStart, setWeekStart] = useState(getWeekStart())
  const [categories, setCategories] = useState<Category[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [loading, setLoading] = useState(true)
  const [reflection, setReflection] = useState('')
  const [wins, setWins] = useState('')
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const supabase = createClient()

  async function load() {
    setLoading(true)
    const [catRes, actRes, weekRes] = await Promise.all([
      supabase.from('categories').select('*').order('sort_order'),
      supabase.from('actions').select('*').eq('week_start', toDateString(weekStart)).order('sort_order'),
      supabase.from('weeks').select('*').eq('week_start', toDateString(weekStart)).maybeSingle(),
    ])
    setCategories(catRes.data ?? [])
    setActions(actRes.data ?? [])
    if (weekRes.data) {
      setReflection(weekRes.data.reflection ?? '')
      setWins(weekRes.data.wins ?? '')
    } else {
      setReflection('')
      setWins('')
    }
    setLoading(false)
  }

  useEffect(() => { load() }, [weekStart])

  async function handleSave() {
    setSaving(true)
    const res = await fetch('/api/weeks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ week_start: toDateString(weekStart), reflection, wins }),
    })
    if (!res.ok) { setSaving(false); return }
    setSaving(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const completed = actions.filter((a) => a.is_complete)
  const incomplete = actions.filter((a) => !a.is_complete)
  const completionPct = actions.length > 0 ? Math.round((completed.length / actions.length) * 100) : 0
  const starCompleted = completed.filter((a) => a.is_starred).length
  const starTotal = actions.filter((a) => a.is_starred).length
  const starPct = starTotal > 0 ? Math.round((starCompleted / starTotal) * 100) : 0
  const completedMins = completed.reduce((s, a) => s + a.estimated_minutes, 0)

  const nonCapture = categories.filter((c) => !c.is_system && !c.is_archived)
  const breakdowns: CategoryBreakdown[] = nonCapture.map((cat) => ({
    category: cat,
    completed: completed.filter((a) => a.category_id === cat.id),
    incomplete: incomplete.filter((a) => a.category_id === cat.id),
  })).filter((b) => b.completed.length + b.incomplete.length > 0)

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Subheader */}
      <div className="sticky top-14 z-40 bg-[#111827] border-b border-[#1f2d45] px-6 py-3 flex items-center justify-between">
        <h1 className="text-sm font-black tracking-widest uppercase text-white">Weekly Reflection</h1>
        <div className="flex items-center gap-4">
          <WeekNavigator weekStart={weekStart} onChange={setWeekStart} />
          <Button size="sm" className="bg-[#22c55e] hover:bg-green-600 text-white h-7 px-3 text-xs gap-1">
            <Check size={12} /> Complete My Week
          </Button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6 space-y-6">
        {/* Stats row */}
        <div className="grid grid-cols-4 gap-3">
          {[
            { label: 'Actions Done', value: `${completed.length}/${actions.length}`, sub: `${completionPct}%` },
            { label: 'Stars Done', value: `${starCompleted}/${starTotal}`, sub: `${starPct}%` },
            { label: 'Time Invested', value: formatMinutes(completedMins), sub: 'estimated' },
            { label: 'Categories', value: breakdowns.length, sub: 'with actions' },
          ].map(({ label, value, sub }) => (
            <div key={label} className="bg-[#111827] border border-[#1f2d45] rounded-xl p-4 text-center">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-1">{label}</p>
              <p className="text-2xl font-black text-white">{value}</p>
              <p className="text-xs text-[#475569] mt-0.5">{sub}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-2 gap-6">
          {/* Left: Reflection fields */}
          <div className="space-y-4">
            <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <Sparkles size={14} className="text-[#f97316]" />
                <h2 className="text-xs font-black tracking-widest uppercase text-white">Wins & Celebrations</h2>
              </div>
              <p className="text-xs text-[#475569] mb-3">What are you most proud of this week?</p>
              <textarea
                value={wins}
                onChange={(e) => setWins(e.target.value)}
                placeholder="I'm proud that I..."
                rows={5}
                className="w-full bg-[#0a0f1a] border border-[#1f2d45] rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#f97316]/50 resize-none"
              />
            </div>

            <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-5">
              <h2 className="text-xs font-black tracking-widest uppercase text-white mb-3">Weekly Reflection</h2>
              <p className="text-xs text-[#475569] mb-3">What did you learn? What would you do differently?</p>
              <textarea
                value={reflection}
                onChange={(e) => setReflection(e.target.value)}
                placeholder="This week I learned..."
                rows={7}
                className="w-full bg-[#0a0f1a] border border-[#1f2d45] rounded-lg px-3 py-2 text-sm text-white placeholder-[#475569] focus:outline-none focus:border-[#f97316]/50 resize-none"
              />
            </div>

            <Button
              onClick={handleSave}
              disabled={saving || saved}
              className="w-full bg-[#f97316] hover:bg-orange-600 text-white"
            >
              {saved ? 'Saved!' : saving ? 'Saving...' : 'Save Reflection'}
            </Button>
          </div>

          {/* Right: Category breakdown */}
          <div className="space-y-3">
            <h2 className="text-xs font-black tracking-widest uppercase text-[#475569]">Category Breakdown</h2>
            {loading ? (
              <div className="space-y-2">
                {[1,2,3].map((i) => <div key={i} className="h-16 rounded-xl bg-[#111827] animate-pulse" />)}
              </div>
            ) : breakdowns.length === 0 ? (
              <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-6 text-center">
                <p className="text-[#475569] text-sm italic">No actions for this week</p>
              </div>
            ) : (
              breakdowns.map(({ category, completed: done, incomplete: todo }) => {
                const pct = (done.length + todo.length) > 0 ? Math.round(done.length / (done.length + todo.length) * 100) : 0
                const Icon = ICON_MAP[category.icon] ?? ICON_MAP['list']
                return (
                  <CategoryBreakdownCard
                    key={category.id}
                    category={category}
                    Icon={Icon}
                    done={done}
                    todo={todo}
                    pct={pct}
                  />
                )
              })
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

function CategoryBreakdownCard({ category, Icon, done, todo, pct }: {
  category: Category
  Icon: React.ComponentType<{ size?: number; className?: string }>
  done: Action[]
  todo: Action[]
  pct: number
}) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="bg-[#111827] border border-[#1f2d45] rounded-xl overflow-hidden">
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-[#1a2235] transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: category.color }}>
          <Icon size={13} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs font-black tracking-widest uppercase text-white">{category.name}</span>
            <span className="text-xs text-[#94a3b8]">{done.length}/{done.length + todo.length}</span>
          </div>
          {/* Progress bar */}
          <div className="h-1.5 bg-[#1f2d45] rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, backgroundColor: category.color }}
            />
          </div>
        </div>
        {expanded ? <ChevronDown size={13} className="text-[#475569] flex-shrink-0" /> : <ChevronRight size={13} className="text-[#475569] flex-shrink-0" />}
      </div>

      {expanded && (
        <div className="px-4 pb-3 border-t border-[#1f2d45]">
          {done.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-[#22c55e] font-semibold tracking-widest uppercase mb-1">Completed</p>
              <div className="space-y-0.5">
                {done.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 py-0.5">
                    <Check size={11} className="text-[#22c55e] flex-shrink-0" />
                    <span className="text-xs text-[#94a3b8] line-through">{a.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {todo.length > 0 && (
            <div className="pt-2">
              <p className="text-xs text-[#475569] font-semibold tracking-widest uppercase mb-1">Incomplete</p>
              <div className="space-y-0.5">
                {todo.map((a) => (
                  <div key={a.id} className="flex items-center gap-2 py-0.5">
                    <div className="w-2.5 h-2.5 rounded-full border border-[#475569] flex-shrink-0" />
                    <span className="text-xs text-[#475569]">{a.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
