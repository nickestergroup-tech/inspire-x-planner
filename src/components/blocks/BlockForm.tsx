'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { RpmBlock, Category, Project, Action } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Check } from 'lucide-react'

interface BlockFormProps {
  open: boolean
  onClose: () => void
  onSave: (block: RpmBlock) => void
  initial?: RpmBlock
  defaultCategoryId?: string
  defaultProjectId?: string
}

export function BlockForm({
  open,
  onClose,
  onSave,
  initial,
  defaultCategoryId,
  defaultProjectId,
}: BlockFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [result, setResult] = useState(initial?.result ?? '')
  const [purpose, setPurpose] = useState(initial?.purpose ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? defaultCategoryId ?? '')
  const [projectId, setProjectId] = useState(initial?.project_id ?? defaultProjectId ?? '')
  const [selectedActionIds, setSelectedActionIds] = useState<string[]>(
    initial?.actions?.map((a) => a.id) ?? []
  )
  const [categories, setCategories] = useState<Category[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [availableActions, setAvailableActions] = useState<Action[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data ?? [])
    })
    supabase.from('projects').select('*').eq('is_archived', false).order('name').then(({ data }) => {
      setProjects(data ?? [])
    })
  }, [open])

  useEffect(() => {
    if (!categoryId) { setAvailableActions([]); return }
    supabase
      .from('actions')
      .select('*')
      .eq('category_id', categoryId)
      .eq('is_recurring', false)
      .is('block_id', null)
      .eq('is_complete', false)
      .then(({ data }) => setAvailableActions(data ?? []))
  }, [categoryId])

  function toggleAction(id: string) {
    setSelectedActionIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    let blockData: RpmBlock | null = null

    if (initial) {
      const { data, error } = await supabase
        .from('rpm_blocks')
        .update({
          name: name || null,
          result: result || null,
          purpose: purpose || null,
          category_id: categoryId || null,
          project_id: projectId || null,
        })
        .eq('id', initial.id)
        .select()
        .single()
      if (error) { setError(error.message); setSaving(false); return }
      blockData = data
    } else {
      const { data, error } = await supabase
        .from('rpm_blocks')
        .insert({
          user_id: user.id,
          name: name || null,
          result: result || null,
          purpose: purpose || null,
          category_id: categoryId || null,
          project_id: projectId || null,
        })
        .select()
        .single()
      if (error) { setError(error.message); setSaving(false); return }
      blockData = data
    }

    if (blockData) {
      // Assign selected actions to this block
      if (selectedActionIds.length > 0) {
        await supabase
          .from('actions')
          .update({ block_id: blockData.id })
          .in('id', selectedActionIds)
      }
      onSave(blockData)
    }

    setSaving(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border-[#1f2d45] text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initial ? 'Edit RPM Block' : 'Create RPM Block'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Block Name (optional)
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Morning routine block"
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569]"
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

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Result
            </label>
            <Textarea
              value={result}
              onChange={(e) => setResult(e.target.value)}
              placeholder="A specific, measurable outcome…"
              rows={2}
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Purpose
            </label>
            <Textarea
              value={purpose}
              onChange={(e) => setPurpose(e.target.value)}
              placeholder="The deeper, emotional reason…"
              rows={2}
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] resize-none"
            />
          </div>

          {/* Add actions */}
          {availableActions.length > 0 && (
            <div>
              <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
                Add Actions to Block
              </label>
              <div className="max-h-40 overflow-y-auto space-y-1 bg-[#1a2235] rounded-lg p-2">
                {availableActions.map((action) => {
                  const selected = selectedActionIds.includes(action.id)
                  return (
                    <button
                      key={action.id}
                      type="button"
                      onClick={() => toggleAction(action.id)}
                      className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm text-left transition-colors ${
                        selected ? 'bg-[#f97316]/20 text-white' : 'text-[#94a3b8] hover:bg-[#111827]'
                      }`}
                    >
                      <div
                        className="w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center"
                        style={{ borderColor: selected ? '#f97316' : '#1f2d45', backgroundColor: selected ? '#f97316' : 'transparent' }}
                      >
                        {selected && <Check size={10} className="text-white" strokeWidth={3} />}
                      </div>
                      {action.title}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

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
              disabled={saving}
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white"
            >
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Block'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
