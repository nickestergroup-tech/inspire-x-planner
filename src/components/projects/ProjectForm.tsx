'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Project, Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { CoverImagePicker } from '@/components/shared/CoverImagePicker'

interface ProjectFormProps {
  open: boolean
  onClose: () => void
  onSave: (project: Project) => void
  initial?: Project
  defaultCategoryId?: string
}

export function ProjectForm({ open, onClose, onSave, initial, defaultCategoryId }: ProjectFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [ultimateResult, setUltimateResult] = useState(initial?.ultimate_result ?? '')
  const [ultimatePurpose, setUltimatePurpose] = useState(initial?.ultimate_purpose ?? '')
  const [categoryId, setCategoryId] = useState(initial?.category_id ?? defaultCategoryId ?? '')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initial?.cover_image_url ?? null)
  const [categories, setCategories] = useState<Category[]>([])
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!open) return
    supabase.from('categories').select('*').order('sort_order').then(({ data }) => {
      setCategories(data ?? [])
    })
  }, [open])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (initial) {
      const { data, error } = await supabase
        .from('projects')
        .update({
          name,
          ultimate_result: ultimateResult || null,
          ultimate_purpose: ultimatePurpose || null,
          category_id: categoryId || null,
          cover_image_url: coverImageUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', initial.id)
        .select()
        .single()

      if (error) { setError(error.message); setSaving(false); return }
      onSave(data)
    } else {
      const { data: maxOrder } = await supabase
        .from('projects')
        .select('sort_order')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      const { data, error } = await supabase
        .from('projects')
        .insert({
          user_id: user.id,
          name,
          ultimate_result: ultimateResult || null,
          ultimate_purpose: ultimatePurpose || null,
          category_id: categoryId || null,
          cover_image_url: coverImageUrl,
          sort_order: (maxOrder?.sort_order ?? 0) + 1,
        })
        .select()
        .single()

      if (error) { setError(error.message); setSaving(false); return }
      onSave(data)
    }

    setSaving(false)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="bg-[#111827] border-[#1f2d45] text-white max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-white">
            {initial ? 'Edit Project' : 'Create Project'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Project Name
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Launch new product line"
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569]"
            />
          </div>

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
              {categories.filter((c) => !c.is_system).map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Ultimate Result
            </label>
            <Textarea
              value={ultimateResult}
              onChange={(e) => setUltimateResult(e.target.value)}
              placeholder="A specific, measurable outcome you'll achieve…"
              rows={2}
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Ultimate Purpose
            </label>
            <Textarea
              value={ultimatePurpose}
              onChange={(e) => setUltimatePurpose(e.target.value)}
              placeholder="The deeper, emotional reason for completing this project…"
              rows={2}
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] resize-none"
            />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-3">
              Cover Image
            </label>
            <CoverImagePicker value={coverImageUrl} onChange={setCoverImageUrl} uploadPath="projects" />
          </div>

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
              disabled={saving || !name.trim()}
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white"
            >
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Project'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
