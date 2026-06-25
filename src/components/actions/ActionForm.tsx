'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Action, Category, Project } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Star } from 'lucide-react'
import { getWeekStart, toDateString } from '@/lib/dates'

interface ActionFormProps {
  open: boolean
  onClose: () => void
  onSave: (action: Action) => void
  initial?: Action
  defaultCategoryId?: string
  defaultProjectId?: string
  defaultPlannedDate?: string
}

export function ActionForm({
  open,
  onClose,
  onSave,
  initial,
  defaultCategoryId,
  defaultProjectId,
  defaultPlannedDate,
}: ActionFormProps) {
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [projectId, setProjectId] = useState('')
  const [estimatedHours, setEstimatedHours] = useState(0)
  const [estimatedMins, setEstimatedMins] = useState(30)
  const [isStarred, setIsStarred] = useState(false)
  const [weekStart, setWeekStart] = useState(toDateString(getWeekStart()))
  const [plannedDate, setPlannedDate] = useState('')
  const [recurrence, setRecurrence] = useState('')
  const [categories, setCategories] = useState<Category[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  // Reset form state every time the dialog opens
  useEffect(() => {
    if (!open) return
    setTitle(initial?.title ?? '')
    setNotes(initial?.notes ?? '')
    setCategoryId(initial?.category_id ?? defaultCategoryId ?? '')
    setProjectId(initial?.project_id ?? defaultProjectId ?? '')
    setEstimatedHours(Math.floor((initial?.estimated_minutes ?? 30) / 60))
    setEstimatedMins((initial?.estimated_minutes ?? 30) % 60)
    setIsStarred(initial?.is_starred ?? false)
    setWeekStart(initial?.week_start ?? toDateString(getWeekStart()))
    setPlannedDate(initial?.planned_date ?? defaultPlannedDate ?? '')
    setRecurrence(initial?.recurrence_rule ?? '')

    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data ?? [])
      if (!initial?.category_id && !defaultCategoryId && data && data.length > 0) {
        const capture = data.find((c) => c.is_system)
        setCategoryId(capture?.id ?? data[0].id)
      }
    })
    supabase.from('projects').select('*').eq('is_archived', false).order('name').then(({ data }) => {
      setProjects(data ?? [])
    })
  }, [open])

  function syncToNylas(actionId: string, plannedDateVal: string | null, existingEventId: string | null) {
    if (!plannedDateVal) return
    fetch('/api/calendar/nylas/sync-action', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action_id: actionId,
        title,
        planned_date: plannedDateVal,
        estimated_minutes: estimatedHours * 60 + estimatedMins,
        notes: notes || null,
        nylas_event_id: existingEventId,
      }),
    }).catch(() => {})
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const estimated_minutes = estimatedHours * 60 + estimatedMins

    if (initial) {
      const { data, error } = await supabase
        .from('actions')
        .update({
          title,
          notes: notes || null,
          category_id: categoryId || null,
          project_id: projectId || null,
          estimated_minutes,
          is_starred: isStarred,
          week_start: weekStart || null,
          planned_date: plannedDate || null,
          recurrence_rule: recurrence || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initial.id)
        .select()
        .single()

      if (error) { setError(error.message); setSaving(false); return }
      syncToNylas(data.id, data.planned_date, data.nylas_event_id)
      onSave(data)
    } else {
      const { data, error } = await supabase
        .from('actions')
        .insert({
          user_id: user.id,
          title,
          notes: notes || null,
          category_id: categoryId || null,
          project_id: projectId || null,
          estimated_minutes,
          is_starred: isStarred,
          week_start: weekStart || null,
          planned_date: plannedDate || null,
          recurrence_rule: recurrence || null,
        })
        .select()
        .single()

      if (error) { setError(error.message); setSaving(false); return }
      syncToNylas(data.id, data.planned_date, null)
      onSave(data)
    }

    setSaving(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border-[#1f2d45] text-white max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initial ? 'Edit Action' : 'Create Action'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Title
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              placeholder="What needs to get done?"
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569]"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Notes
            </label>
            <Textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any context or details…"
              rows={2}
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
                Category
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full bg-[#1a2235] border border-[#1f2d45] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              >
                <option value="">No category</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
                Project
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full bg-[#1a2235] border border-[#1f2d45] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              >
                <option value="">No project</option>
                {projects
                  .filter((p) => !categoryId || p.category_id === categoryId)
                  .map((p) => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
              </select>
            </div>
          </div>

          {/* Duration */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Duration
            </label>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={23}
                  value={estimatedHours}
                  onChange={(e) => setEstimatedHours(parseInt(e.target.value) || 0)}
                  className="bg-[#1a2235] border-[#1f2d45] text-white w-20 text-center"
                />
                <span className="text-[#94a3b8] text-sm">h</span>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min={0}
                  max={55}
                  step={5}
                  value={estimatedMins}
                  onChange={(e) => setEstimatedMins(parseInt(e.target.value) || 0)}
                  className="bg-[#1a2235] border-[#1f2d45] text-white w-20 text-center"
                />
                <span className="text-[#94a3b8] text-sm">m</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
                Planned Date
              </label>
              <Input
                type="date"
                value={plannedDate}
                onChange={(e) => setPlannedDate(e.target.value)}
                className="bg-[#1a2235] border-[#1f2d45] text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
                Recurrence
              </label>
              <select
                value={recurrence}
                onChange={(e) => setRecurrence(e.target.value)}
                className="w-full bg-[#1a2235] border border-[#1f2d45] text-white rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#f97316]"
              >
                <option value="">Does not repeat</option>
                <option value="FREQ=DAILY">Daily</option>
                <option value="FREQ=WEEKLY">Weekly</option>
                <option value="FREQ=MONTHLY">Monthly</option>
              </select>
            </div>
          </div>

          {/* Priority star */}
          <button
            type="button"
            onClick={() => setIsStarred((v) => !v)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg border transition-colors text-sm font-medium ${
              isStarred
                ? 'border-yellow-400 bg-yellow-400/10 text-yellow-400'
                : 'border-[#1f2d45] text-[#94a3b8] hover:border-yellow-400 hover:text-yellow-400'
            }`}
          >
            <Star size={14} fill={isStarred ? 'currentColor' : 'none'} />
            {isStarred ? 'Priority action' : 'Mark as priority'}
          </button>

          {error && <p className="text-[#ef4444] text-sm">{error}</p>}

          <div className="flex gap-3 justify-end">
            <Button
              type="button"
              variant="ghost"
              onClick={onClose}
              className="text-[#94a3b8] hover:text-white hover:bg-[#1a2235]"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving || !title.trim()}
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white"
            >
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Action'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
