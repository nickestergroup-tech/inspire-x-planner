'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Category } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ColorPicker } from './ColorPicker'
import { IconPicker } from './IconPicker'
import { CoverImagePicker } from '@/components/shared/CoverImagePicker'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSave: (category: Category) => void
  initial?: Category
}

export function CategoryForm({ open, onClose, onSave, initial }: CategoryFormProps) {
  const [name, setName] = useState(initial?.name ?? '')
  const [color, setColor] = useState(initial?.color ?? '#f97316')
  const [icon, setIcon] = useState(initial?.icon ?? 'target')
  const [coverImageUrl, setCoverImageUrl] = useState<string | null>(initial?.cover_image_url ?? null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setError(null)

    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    if (initial) {
      const { data, error } = await supabase
        .from('categories')
        .update({ name, color, icon, cover_image_url: coverImageUrl, updated_at: new Date().toISOString() })
        .eq('id', initial.id)
        .select()
        .single()

      if (error) { setError(error.message); setSaving(false); return }
      onSave(data)
    } else {
      const { data: maxOrder } = await supabase
        .from('categories')
        .select('sort_order')
        .eq('user_id', user.id)
        .order('sort_order', { ascending: false })
        .limit(1)
        .single()

      const { data, error } = await supabase
        .from('categories')
        .insert({
          user_id: user.id,
          name,
          color,
          icon,
          cover_image_url: coverImageUrl,
          sort_order: (maxOrder?.sort_order ?? 0) + 1,
        })
        .select()
        .single()

      if (error) { setError(error.message); setSaving(false); return }

      // Seed default goal horizons
      await supabase.from('goal_horizons').insert([
        { category_id: data.id, label: '1 Year', timeframe_type: '1 Year', sort_order: 0 },
        { category_id: data.id, label: '90 Days', timeframe_type: '90 Days', sort_order: 1 },
      ])

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
            {initial ? 'Edit Category' : 'Create Category'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Name */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-2">
              Name <span className="text-[#475569] font-normal normal-case">({name.length}/50)</span>
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value.slice(0, 50))}
              required
              placeholder="e.g. Health, Career, Family"
              className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569]"
            />
          </div>

          {/* Color */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-3">
              Color
            </label>
            <ColorPicker value={color} onChange={setColor} />
          </div>

          {/* Icon */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-3">
              Icon
            </label>
            <IconPicker value={icon} onChange={setIcon} color={color} />
          </div>

          {/* Cover Image */}
          <div>
            <label className="block text-xs font-semibold tracking-widest uppercase text-[#94a3b8] mb-3">
              Cover Image
            </label>
            <CoverImagePicker value={coverImageUrl} onChange={setCoverImageUrl} uploadPath={`categories`} />
          </div>

          {/* Preview */}
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1a2235]">
            <div
              className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
              style={{ backgroundColor: color }}
            >
              <span className="text-white text-sm font-bold">
                {name.charAt(0).toUpperCase() || '?'}
              </span>
            </div>
            <div>
              <p className="text-white font-black tracking-widest uppercase text-sm">
                {name || 'Category Name'}
              </p>
              <p className="text-xs text-[#94a3b8]">Preview</p>
            </div>
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
              {saving ? 'Saving…' : initial ? 'Save Changes' : 'Create Category'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
