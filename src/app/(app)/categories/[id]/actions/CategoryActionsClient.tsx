'use client'

import { useState, useEffect, useMemo } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Plus, Search, ChevronDown, ChevronRight,
} from 'lucide-react'
import { Category, Action, RpmBlock } from '@/types'
import { ICON_MAP } from '@/components/categories/IconPicker'
import { ActionItem } from '@/components/actions/ActionItem'
import { ActionForm } from '@/components/actions/ActionForm'
import { BlockCard } from '@/components/blocks/BlockCard'
import { BlockForm } from '@/components/blocks/BlockForm'
import { TimeDisplay } from '@/components/shared/TimeDisplay'
import { createClient } from '@/lib/supabase/client'
import { Input } from '@/components/ui/input'

interface CategoryActionsClientProps {
  category: Category
}

export function CategoryActionsClient({ category }: CategoryActionsClientProps) {
  const Icon = ICON_MAP[category.icon] ?? ICON_MAP['list']
  const supabase = createClient()

  const [actions, setActions] = useState<Action[]>([])
  const [blocks, setBlocks] = useState<RpmBlock[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState<'all' | 'starred' | 'incomplete' | 'complete'>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showCompletedBlocks, setShowCompletedBlocks] = useState(false)
  const [actionFormOpen, setActionFormOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<Action | undefined>()
  const [blockFormOpen, setBlockFormOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<RpmBlock | undefined>()

  useEffect(() => {
    Promise.all([
      supabase.from('actions').select('*').eq('category_id', category.id).order('sort_order'),
      supabase
        .from('rpm_blocks')
        .select('*, actions(*)')
        .eq('category_id', category.id)
        .order('sort_order'),
    ]).then(([actionsRes, blocksRes]) => {
      setActions(actionsRes.data ?? [])
      setBlocks(blocksRes.data ?? [])
      setLoading(false)
    })
  }, [category.id])

  const filtered = useMemo(() => {
    let list = actions
    if (search) list = list.filter((a) => a.title.toLowerCase().includes(search.toLowerCase()))
    if (filter === 'starred') list = list.filter((a) => a.is_starred)
    if (filter === 'incomplete') list = list.filter((a) => !a.is_complete)
    if (filter === 'complete') list = list.filter((a) => a.is_complete)
    return list
  }, [actions, search, filter])

  const active = filtered.filter((a) => !a.is_complete)
  const completed = filtered.filter((a) => a.is_complete)
  const activeBlocks = blocks.filter((b) => !b.is_complete)
  const completedBlocks = blocks.filter((b) => b.is_complete)

  const starredMins = actions.filter((a) => a.is_starred && !a.is_complete).reduce((s, a) => s + a.estimated_minutes, 0)
  const totalMins = actions.filter((a) => !a.is_complete).reduce((s, a) => s + a.estimated_minutes, 0)

  function handleActionSaved(action: Action) {
    setActions((prev) => {
      const idx = prev.findIndex((a) => a.id === action.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = action; return next }
      return [...prev, action]
    })
    setEditingAction(undefined)
    setActionFormOpen(false)
  }

  function handleBlockSaved(block: RpmBlock) {
    setBlocks((prev) => {
      const idx = prev.findIndex((b) => b.id === block.id)
      if (idx >= 0) { const next = [...prev]; next[idx] = block; return next }
      return [...prev, block]
    })
    setEditingBlock(undefined)
    setBlockFormOpen(false)
  }

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Hero */}
      <div className="relative h-40 overflow-hidden">
        {category.cover_image_url ? (
          <img src={category.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${category.color}55 0%, ${category.color}22 100%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#0a0f1a]" />
        <div className="absolute top-4 left-6">
          <Link href={`/categories/${category.id}`} className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm">
            <ChevronLeft size={16} /> Big Picture
          </Link>
        </div>
        <div className="absolute bottom-4 left-6 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: category.color }}>
            <Icon size={18} className="text-white" />
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase text-white/60">{category.name}</p>
            <h1 className="text-white font-black tracking-widest uppercase text-xl">Actions &amp; Blocks</h1>
          </div>
        </div>
      </div>

      {/* Tab nav */}
      <div className="max-w-5xl mx-auto px-6 pt-4">
        <div className="flex gap-1 mb-6 bg-[#111827] border border-[#1f2d45] rounded-xl p-1 w-fit">
          <Link
            href={`/categories/${category.id}`}
            className="px-4 py-2 rounded-lg text-[#94a3b8] hover:text-white text-sm font-medium transition-colors"
          >
            The Big Picture
          </Link>
          <span className="px-4 py-2 rounded-lg bg-[#f97316] text-white text-sm font-medium">
            Actions &amp; Blocks
          </span>
        </div>
      </div>

      {/* Main content */}
      <div className="max-w-5xl mx-auto px-6 pb-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT: Actions */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-1">Actions</h2>
                <TimeDisplay starredMinutes={starredMins} totalMinutes={totalMins} />
              </div>
              <button
                onClick={() => { setEditingAction(undefined); setActionFormOpen(true) }}
                className="w-8 h-8 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {/* Search + filter */}
            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#475569]" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search actions…"
                  className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] pl-8 h-8 text-sm"
                />
              </div>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="bg-[#1a2235] border border-[#1f2d45] text-[#94a3b8] rounded-lg px-2 text-xs h-8 focus:outline-none"
              >
                <option value="all">All</option>
                <option value="starred">Starred</option>
                <option value="incomplete">Incomplete</option>
                <option value="complete">Complete</option>
              </select>
            </div>

            {/* Action list */}
            {loading ? (
              <div className="space-y-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-10 rounded-lg bg-[#111827] animate-pulse" />
                ))}
              </div>
            ) : active.length === 0 && !loading ? (
              <div className="text-center py-8 text-[#475569] text-sm">
                No actions yet. Click + to add one.
              </div>
            ) : (
              <div className="space-y-0.5">
                {active.map((action) => (
                  <ActionItem
                    key={action.id}
                    action={action}
                    accentColor={category.color}
                    onUpdate={(a) => setActions((prev) => prev.map((x) => x.id === a.id ? a : x))}
                    onDelete={(id) => setActions((prev) => prev.filter((x) => x.id !== id))}
                    onEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
                  />
                ))}
              </div>
            )}

            {/* Completed section */}
            {completed.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowCompleted((v) => !v)}
                  className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#475569] hover:text-[#94a3b8] mb-2"
                >
                  {showCompleted ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {completed.length} Completed
                </button>
                {showCompleted && (
                  <div className="space-y-0.5">
                    {completed.map((action) => (
                      <ActionItem
                        key={action.id}
                        action={action}
                        accentColor={category.color}
                        onUpdate={(a) => setActions((prev) => prev.map((x) => x.id === a.id ? a : x))}
                        onDelete={(id) => setActions((prev) => prev.filter((x) => x.id !== id))}
                        onEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* RIGHT: Blocks */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-semibold tracking-widest uppercase text-[#475569]">Focus Blocks</h2>
              <button
                onClick={() => { setEditingBlock(undefined); setBlockFormOpen(true) }}
                className="w-8 h-8 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors"
              >
                <Plus size={16} />
              </button>
            </div>

            {activeBlocks.length === 0 && !loading ? (
              <div className="text-center py-8 text-[#475569] text-sm bg-[#111827] rounded-xl border border-[#1f2d45]">
                <p className="mb-2">No Focus Blocks yet.</p>
                <p className="text-xs">Group your actions into focused blocks with a Result &amp; Purpose.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {activeBlocks.map((block) => (
                  <BlockCard
                    key={block.id}
                    block={block}
                    accentColor={category.color}
                    onUpdate={(b) => setBlocks((prev) => prev.map((x) => x.id === b.id ? b : x))}
                    onDelete={(id) => setBlocks((prev) => prev.filter((x) => x.id !== id))}
                    onEdit={(b) => { setEditingBlock(b); setBlockFormOpen(true) }}
                  />
                ))}
              </div>
            )}

            {completedBlocks.length > 0 && (
              <div className="mt-4">
                <button
                  onClick={() => setShowCompletedBlocks((v) => !v)}
                  className="flex items-center gap-2 text-xs font-semibold tracking-widest uppercase text-[#475569] hover:text-[#94a3b8] mb-2"
                >
                  {showCompletedBlocks ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
                  {completedBlocks.length} Completed Blocks
                </button>
                {showCompletedBlocks && (
                  <div className="space-y-3 opacity-60">
                    {completedBlocks.map((block) => (
                      <BlockCard
                        key={block.id}
                        block={block}
                        accentColor={category.color}
                        onUpdate={(b) => setBlocks((prev) => prev.map((x) => x.id === b.id ? b : x))}
                        onDelete={(id) => setBlocks((prev) => prev.filter((x) => x.id !== id))}
                        onEdit={(b) => { setEditingBlock(b); setBlockFormOpen(true) }}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      <ActionForm
        open={actionFormOpen}
        onClose={() => { setActionFormOpen(false); setEditingAction(undefined) }}
        onSave={handleActionSaved}
        initial={editingAction}
        defaultCategoryId={category.id}
      />
      <BlockForm
        open={blockFormOpen}
        onClose={() => { setBlockFormOpen(false); setEditingBlock(undefined) }}
        onSave={handleBlockSaved}
        initial={editingBlock}
        defaultCategoryId={category.id}
      />
    </div>
  )
}
