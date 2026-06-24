'use client'

import { useEffect, useState } from 'react'
import { Plus, LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react'
import { Category } from '@/types'
import { createClient } from '@/lib/supabase/client'
import { CategoryCard } from '@/components/categories/CategoryCard'
import { CategoryForm } from '@/components/categories/CategoryForm'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | undefined>()
  const [showArchived, setShowArchived] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<Category | null>(null)

  const supabase = createClient()

  async function loadCategories() {
    const { data } = await supabase
      .from('categories')
      .select('*')
      .order('sort_order', { ascending: true })

    setCategories(data ?? [])
    setLoading(false)
  }

  useEffect(() => {
    loadCategories()
  }, [])

  const active = categories.filter((c) => !c.is_archived)
  const archived = categories.filter((c) => c.is_archived)

  function handleEdit(cat: Category) {
    setEditingCategory(cat)
    setFormOpen(true)
  }

  function handleCloseForm() {
    setFormOpen(false)
    setEditingCategory(undefined)
  }

  function handleSaved(cat: Category) {
    setCategories((prev) => {
      const idx = prev.findIndex((c) => c.id === cat.id)
      if (idx >= 0) {
        const next = [...prev]
        next[idx] = cat
        return next
      }
      return [...prev, cat]
    })
  }

  async function handleArchive(cat: Category) {
    await supabase
      .from('categories')
      .update({ is_archived: !cat.is_archived })
      .eq('id', cat.id)
    setCategories((prev) =>
      prev.map((c) => (c.id === cat.id ? { ...c, is_archived: !cat.is_archived } : c))
    )
  }

  async function handleDelete(cat: Category) {
    await supabase.from('categories').delete().eq('id', cat.id)
    setCategories((prev) => prev.filter((c) => c.id !== cat.id))
    setDeleteConfirm(null)
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-black tracking-widest uppercase text-white">
            Active Categories
          </h1>
          <p className="text-[#94a3b8] text-sm mt-1">
            {active.length} {active.length === 1 ? 'category' : 'categories'}
          </p>
        </div>
        <Button
          onClick={() => { setEditingCategory(undefined); setFormOpen(true) }}
          className="bg-[#f97316] hover:bg-[#ea6c0a] text-white gap-2"
        >
          <Plus size={16} />
          Create New Category
        </Button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="rounded-xl aspect-[4/3] bg-[#111827] border border-[#1f2d45] animate-pulse"
            />
          ))}
        </div>
      ) : active.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No categories yet"
          description="Create your first life category to start organizing your RPM plan."
          action={
            <Button
              onClick={() => setFormOpen(true)}
              className="bg-[#f97316] hover:bg-[#ea6c0a] text-white gap-2"
            >
              <Plus size={16} />
              Create Category
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {active.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={handleEdit}
              onArchive={handleArchive}
              onDelete={(c) => setDeleteConfirm(c)}
            />
          ))}
        </div>
      )}

      {/* Archived */}
      {archived.length > 0 && (
        <div className="mt-10">
          <button
            onClick={() => setShowArchived((v) => !v)}
            className="flex items-center gap-2 text-sm font-semibold tracking-widest uppercase text-[#475569] hover:text-[#94a3b8] mb-4 transition-colors"
          >
            {showArchived ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
            Archived Categories ({archived.length})
          </button>

          {showArchived && (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 opacity-60">
              {archived.map((cat) => (
                <CategoryCard
                  key={cat.id}
                  category={cat}
                  onEdit={handleEdit}
                  onArchive={handleArchive}
                  onDelete={(c) => setDeleteConfirm(c)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Category Form */}
      <CategoryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSave={handleSaved}
        initial={editingCategory}
      />

      {/* Delete confirm */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#111827] border border-[#1f2d45] rounded-xl p-6 max-w-sm w-full">
            <h3 className="text-white font-semibold text-lg mb-2">Delete Category?</h3>
            <p className="text-[#94a3b8] text-sm mb-6">
              This will permanently delete <strong className="text-white">{deleteConfirm.name}</strong> and all its projects and actions. This cannot be undone.
            </p>
            <div className="flex gap-3 justify-end">
              <Button
                variant="ghost"
                onClick={() => setDeleteConfirm(null)}
                className="text-[#94a3b8] hover:text-white hover:bg-[#1a2235]"
              >
                Cancel
              </Button>
              <Button
                onClick={() => handleDelete(deleteConfirm)}
                className="bg-[#ef4444] hover:bg-red-600 text-white"
              >
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
