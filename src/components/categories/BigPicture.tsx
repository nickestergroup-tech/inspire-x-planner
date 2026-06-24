'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Pencil, Check, X } from 'lucide-react'
import { Category, GoalHorizon, MicroGoal } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'

// Inline editable text
function InlineEdit({
  value,
  onSave,
  placeholder,
  multiline = false,
  className = '',
}: {
  value: string | null
  onSave: (v: string) => Promise<void>
  placeholder: string
  multiline?: boolean
  className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)

  useEffect(() => {
    if (editing) ref.current?.focus()
  }, [editing])

  async function save() {
    await onSave(draft)
    setEditing(false)
  }

  function cancel() {
    setDraft(value ?? '')
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="relative">
        {multiline ? (
          <Textarea
            ref={ref as React.RefObject<HTMLTextAreaElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') cancel()
            }}
            rows={3}
            className="bg-[#1a2235] border-[#1f2d45] text-white w-full resize-none"
          />
        ) : (
          <Input
            ref={ref as React.RefObject<HTMLInputElement>}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') save()
              if (e.key === 'Escape') cancel()
            }}
            className="bg-[#1a2235] border-[#1f2d45] text-white"
          />
        )}
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={save} className="bg-[#f97316] hover:bg-[#ea6c0a] text-white h-7 px-3">
            <Check size={12} className="mr-1" /> Save
          </Button>
          <Button size="sm" variant="ghost" onClick={cancel} className="text-[#94a3b8] h-7 px-3">
            <X size={12} className="mr-1" /> Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div
      onClick={() => setEditing(true)}
      className={`cursor-pointer group relative ${className}`}
    >
      {value ? (
        <div className="flex items-start gap-2">
          <span className="flex-1">{value}</span>
          <Pencil
            size={14}
            className="opacity-0 group-hover:opacity-100 text-[#475569] flex-shrink-0 mt-0.5 transition-opacity"
          />
        </div>
      ) : (
        <span className="text-[#475569] italic">{placeholder}</span>
      )}
    </div>
  )
}

// Micro goal item
function MicroGoalItem({
  goal,
  onToggle,
  onDelete,
}: {
  goal: MicroGoal
  onToggle: (id: string, complete: boolean) => void
  onDelete: (id: string) => void
}) {
  return (
    <div className="flex items-center gap-2 py-1 group">
      <button
        onClick={() => onToggle(goal.id, !goal.is_complete)}
        className="w-4 h-4 rounded border border-[#1f2d45] flex-shrink-0 flex items-center justify-center hover:border-[#f97316] transition-colors"
        style={{ backgroundColor: goal.is_complete ? '#f97316' : 'transparent' }}
      >
        {goal.is_complete && <Check size={10} className="text-white" strokeWidth={3} />}
      </button>
      <span
        className={`text-sm flex-1 ${
          goal.is_complete ? 'line-through text-[#475569]' : 'text-[#94a3b8]'
        }`}
      >
        {goal.title}
      </span>
      <button
        onClick={() => onDelete(goal.id)}
        className="opacity-0 group-hover:opacity-100 text-[#475569] hover:text-[#ef4444] transition-all"
      >
        <X size={12} />
      </button>
    </div>
  )
}

// Goal Horizon card
function HorizonCard({
  horizon,
  onUpdate,
  onDelete,
}: {
  horizon: GoalHorizon
  onUpdate: (h: GoalHorizon) => void
  onDelete: (id: string) => void
}) {
  const [microGoals, setMicroGoals] = useState<MicroGoal[]>(horizon.micro_goals ?? [])
  const [newGoal, setNewGoal] = useState('')
  const supabase = createClient()

  async function updateContent(content: string) {
    await supabase.from('goal_horizons').update({ content }).eq('id', horizon.id)
    onUpdate({ ...horizon, content })
  }

  async function addMicroGoal() {
    if (!newGoal.trim()) return
    const { data } = await supabase
      .from('micro_goals')
      .insert({
        horizon_id: horizon.id,
        title: newGoal.trim(),
        sort_order: microGoals.length,
      })
      .select()
      .single()
    if (data) setMicroGoals((prev) => [...prev, data])
    setNewGoal('')
  }

  async function toggleGoal(id: string, is_complete: boolean) {
    await supabase.from('micro_goals').update({ is_complete }).eq('id', id)
    setMicroGoals((prev) => prev.map((g) => (g.id === id ? { ...g, is_complete } : g)))
  }

  async function deleteGoal(id: string) {
    await supabase.from('micro_goals').delete().eq('id', id)
    setMicroGoals((prev) => prev.filter((g) => g.id !== id))
  }

  return (
    <div className="bg-[#111827] rounded-xl border border-[#1f2d45] p-5">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs font-semibold tracking-widest uppercase text-[#f97316]">
          {horizon.label}
        </span>
        <button
          onClick={() => onDelete(horizon.id)}
          className="text-[#475569] hover:text-[#ef4444] transition-colors"
        >
          <X size={14} />
        </button>
      </div>

      <InlineEdit
        value={horizon.content}
        onSave={updateContent}
        placeholder="Click to add your goals for this timeframe…"
        multiline
        className="text-white text-sm leading-relaxed mb-4"
      />

      {/* Micro goals */}
      <div className="mt-4 border-t border-[#1f2d45] pt-3">
        <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-2">
          Micro Goals
        </p>
        <div className="space-y-0.5 mb-3">
          {microGoals.map((g) => (
            <MicroGoalItem key={g.id} goal={g} onToggle={toggleGoal} onDelete={deleteGoal} />
          ))}
        </div>
        <div className="flex gap-2">
          <Input
            value={newGoal}
            onChange={(e) => setNewGoal(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addMicroGoal()}
            placeholder="Add micro goal…"
            className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] h-8 text-sm"
          />
          <Button
            size="sm"
            onClick={addMicroGoal}
            className="bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white h-8 px-3"
          >
            <Plus size={14} />
          </Button>
        </div>
      </div>
    </div>
  )
}

interface BigPictureProps {
  category: Category
  onCategoryUpdate: (c: Category) => void
}

export function BigPicture({ category, onCategoryUpdate }: BigPictureProps) {
  const [horizons, setHorizons] = useState<GoalHorizon[]>([])
  const [addingHorizon, setAddingHorizon] = useState(false)
  const [newHorizonLabel, setNewHorizonLabel] = useState('')
  const supabase = createClient()

  useEffect(() => {
    supabase
      .from('goal_horizons')
      .select('*, micro_goals(*)')
      .eq('category_id', category.id)
      .order('sort_order')
      .then(({ data }) => setHorizons(data ?? []))
  }, [category.id])

  async function updateField(field: keyof Category, value: string) {
    await supabase
      .from('categories')
      .update({ [field]: value, updated_at: new Date().toISOString() })
      .eq('id', category.id)
    onCategoryUpdate({ ...category, [field]: value })
  }

  async function addHorizon() {
    if (!newHorizonLabel.trim()) return
    const { data } = await supabase
      .from('goal_horizons')
      .insert({
        category_id: category.id,
        label: newHorizonLabel.trim(),
        sort_order: horizons.length,
      })
      .select()
      .single()
    if (data) setHorizons((prev) => [...prev, { ...data, micro_goals: [] }])
    setNewHorizonLabel('')
    setAddingHorizon(false)
  }

  async function deleteHorizon(id: string) {
    await supabase.from('goal_horizons').delete().eq('id', id)
    setHorizons((prev) => prev.filter((h) => h.id !== id))
  }

  return (
    <div className="space-y-8">
      {/* Ultimate Vision */}
      <section>
        <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-3">
          My Ultimate Vision
        </p>
        <InlineEdit
          value={category.ultimate_vision}
          onSave={(v) => updateField('ultimate_vision', v)}
          placeholder="Click to add your ultimate vision statement…"
          multiline
          className="text-white text-xl font-semibold leading-relaxed"
        />
      </section>

      {/* Roles + Purpose — 2 col */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <section className="bg-[#111827] rounded-xl border border-[#1f2d45] p-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-3">
            My Roles
          </p>
          <InlineEdit
            value={category.my_roles}
            onSave={(v) => updateField('my_roles', v)}
            placeholder="Who are you in this area of life?"
            multiline
            className="text-[#94a3b8] text-sm leading-relaxed"
          />
        </section>

        <section className="bg-[#111827] rounded-xl border border-[#1f2d45] p-5">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-3">
            My Ultimate Purpose
          </p>
          <InlineEdit
            value={category.ultimate_purpose}
            onSave={(v) => updateField('ultimate_purpose', v)}
            placeholder="The deep why behind this category…"
            multiline
            className="text-[#94a3b8] text-sm leading-relaxed"
          />
        </section>
      </div>

      {/* Goal Horizons */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <p className="text-xs font-semibold tracking-widest uppercase text-[#475569]">
            Goal Horizons
          </p>
          <Button
            size="sm"
            onClick={() => setAddingHorizon(true)}
            className="bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white h-7 px-3 text-xs gap-1"
          >
            <Plus size={12} />
            Add Horizon
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {horizons.map((h) => (
            <HorizonCard
              key={h.id}
              horizon={h}
              onUpdate={(updated) =>
                setHorizons((prev) => prev.map((x) => (x.id === updated.id ? updated : x)))
              }
              onDelete={deleteHorizon}
            />
          ))}
        </div>

        {addingHorizon && (
          <div className="flex gap-2 mt-4">
            <Input
              value={newHorizonLabel}
              onChange={(e) => setNewHorizonLabel(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') addHorizon()
                if (e.key === 'Escape') setAddingHorizon(false)
              }}
              placeholder="e.g. 1 Year, 90 Days, Q3…"
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569]"
              autoFocus
            />
            <Button onClick={addHorizon} className="bg-[#f97316] hover:bg-[#ea6c0a] text-white">
              Add
            </Button>
            <Button
              variant="ghost"
              onClick={() => setAddingHorizon(false)}
              className="text-[#94a3b8]"
            >
              Cancel
            </Button>
          </div>
        )}
      </section>
    </div>
  )
}
