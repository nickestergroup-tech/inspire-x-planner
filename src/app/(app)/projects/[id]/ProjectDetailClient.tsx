'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import {
  ChevronLeft, Plus, Star, Calendar, Pencil, Trash2, Check, X, ImagePlus,
} from 'lucide-react'
import { Project, Category, KeyResult, Action, RpmBlock } from '@/types'
import { CategoryBadge } from '@/components/shared/CategoryBadge'
import { ProgressBar } from '@/components/shared/ProgressBar'
import { ActionItem } from '@/components/actions/ActionItem'
import { ActionForm } from '@/components/actions/ActionForm'
import { BlockCard } from '@/components/blocks/BlockCard'
import { BlockForm } from '@/components/blocks/BlockForm'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { format } from 'date-fns'

function InlineEdit({
  value, onSave, placeholder, multiline = false, className = '',
}: {
  value: string | null; onSave: (v: string) => Promise<void>
  placeholder: string; multiline?: boolean; className?: string
}) {
  const [editing, setEditing] = useState(false)
  const [draft, setDraft] = useState(value ?? '')
  const ref = useRef<HTMLTextAreaElement | HTMLInputElement>(null)
  useEffect(() => { if (editing) ref.current?.focus() }, [editing])

  async function save() { await onSave(draft); setEditing(false) }
  function cancel() { setDraft(value ?? ''); setEditing(false) }

  if (editing) {
    return (
      <div>
        {multiline ? (
          <Textarea ref={ref as React.RefObject<HTMLTextAreaElement>} value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => e.key === 'Escape' && cancel()}
            rows={4} className="bg-[#0a0f1a] border-[#1f2d45] text-white resize-none w-full" />
        ) : (
          <Input ref={ref as React.RefObject<HTMLInputElement>} value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') save(); if (e.key === 'Escape') cancel() }}
            className="bg-[#0a0f1a] border-[#1f2d45] text-white" />
        )}
        <div className="flex gap-2 mt-2">
          <Button size="sm" onClick={save} className="bg-[#f97316] hover:bg-[#ea6c0a] text-white h-7 px-3">
            <Check size={12} className="mr-1" />Save
          </Button>
          <Button size="sm" variant="ghost" onClick={cancel} className="text-[#94a3b8] h-7 px-3">
            <X size={12} className="mr-1" />Cancel
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div onClick={() => setEditing(true)} className={`cursor-pointer group relative ${className}`}>
      {value ? (
        <div className="flex items-start gap-2">
          <span className="flex-1">{value}</span>
          <Pencil size={12} className="opacity-0 group-hover:opacity-100 text-[#475569] flex-shrink-0 mt-0.5 transition-opacity" />
        </div>
      ) : (
        <span className="text-[#475569] italic text-sm">{placeholder}</span>
      )}
    </div>
  )
}

interface ProjectDetailClientProps {
  initialProject: Project
  category: Category | null
}

export function ProjectDetailClient({ initialProject, category }: ProjectDetailClientProps) {
  const [project, setProject] = useState(initialProject)
  const [keyResults, setKeyResults] = useState<KeyResult[]>([])
  const [actions, setActions] = useState<Action[]>([])
  const [blocks, setBlocks] = useState<RpmBlock[]>([])
  const [editingKR, setEditingKR] = useState<KeyResult | null>(null)
  const [newKRTitle, setNewKRTitle] = useState('')
  const [addingKR, setAddingKR] = useState(false)
  const [actionFormOpen, setActionFormOpen] = useState(false)
  const [editingAction, setEditingAction] = useState<Action | undefined>()
  const [blockFormOpen, setBlockFormOpen] = useState(false)
  const [editingBlock, setEditingBlock] = useState<RpmBlock | undefined>()

  const supabase = createClient()

  useEffect(() => {
    Promise.all([
      supabase.from('key_results').select('*').eq('project_id', project.id).order('sort_order'),
      supabase.from('actions').select('*').eq('project_id', project.id).order('sort_order'),
      supabase.from('rpm_blocks').select('*, actions(*)').eq('project_id', project.id).order('sort_order'),
    ]).then(([kr, act, blk]) => {
      setKeyResults(kr.data ?? [])
      setActions(act.data ?? [])
      setBlocks(blk.data ?? [])
    })
  }, [project.id])

  async function updateProject(field: keyof Project, value: string) {
    await supabase.from('projects').update({ [field]: value, updated_at: new Date().toISOString() }).eq('id', project.id)
    setProject((p) => ({ ...p, [field]: value }))
  }

  async function addKeyResult() {
    if (!newKRTitle.trim()) return
    const { data } = await supabase.from('key_results').insert({
      project_id: project.id,
      title: newKRTitle.trim(),
      sort_order: keyResults.length,
    }).select().single()
    if (data) setKeyResults((prev) => [...prev, data])
    setNewKRTitle('')
    setAddingKR(false)
  }

  async function toggleKR(kr: KeyResult) {
    const is_complete = !kr.is_complete
    await supabase.from('key_results').update({ is_complete }).eq('id', kr.id)
    setKeyResults((prev) => prev.map((k) => k.id === kr.id ? { ...k, is_complete } : k))
  }

  async function toggleKRStar(kr: KeyResult) {
    const is_starred = !kr.is_starred
    await supabase.from('key_results').update({ is_starred }).eq('id', kr.id)
    setKeyResults((prev) => prev.map((k) => k.id === kr.id ? { ...k, is_starred } : k))
  }

  async function deleteKR(id: string) {
    await supabase.from('key_results').delete().eq('id', id)
    setKeyResults((prev) => prev.filter((k) => k.id !== id))
  }

  // Progress calculations
  const starredActions = actions.filter((a) => a.is_starred)
  const starredDone = starredActions.filter((a) => a.is_complete).length
  const starredPct = starredActions.length > 0 ? (starredDone / starredActions.length) * 100 : 0
  const starredHours = Math.round(starredActions.reduce((s, a) => s + a.estimated_minutes, 0) / 60 * 10) / 10

  const allDone = actions.filter((a) => a.is_complete).length
  const allPct = actions.length > 0 ? (allDone / actions.length) * 100 : 0
  const allHours = Math.round(actions.reduce((s, a) => s + a.estimated_minutes, 0) / 60 * 10) / 10

  // Capture list = actions not in a block
  const captureList = actions.filter((a) => !a.block_id && !a.is_complete)
  const captureCompleted = actions.filter((a) => !a.block_id && a.is_complete)

  const accentColor = category?.color ?? '#f97316'

  return (
    <div className="min-h-screen bg-[#0a0f1a]">
      {/* Hero */}
      <div className="relative h-56 overflow-hidden">
        {project.cover_image_url ? (
          <img src={project.cover_image_url} alt="" className="absolute inset-0 w-full h-full object-cover" />
        ) : (
          <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${accentColor}44 0%, ${accentColor}11 100%)` }} />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-[#0a0f1a]" />
        <div className="absolute top-4 left-6">
          <Link href="/projects" className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm">
            <ChevronLeft size={16} />Projects
          </Link>
        </div>
        <div className="absolute bottom-4 left-6">
          {category && <CategoryBadge category={category} size="sm" />}
          <h1 className="text-white font-black tracking-widest uppercase text-3xl mt-2">{project.name}</h1>
        </div>
      </div>

      {/* Progress bars */}
      <div className="max-w-6xl mx-auto px-6 py-4">
        <div className="grid grid-cols-2 gap-4 mb-8">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#475569]">
                ⭐ Starred Actions
              </span>
              <span className="text-xs text-[#94a3b8]">{starredDone}/{starredActions.length} · {starredHours}h</span>
            </div>
            <ProgressBar value={starredPct} color={accentColor} />
          </div>
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold tracking-widest uppercase text-[#475569]">
                All Actions
              </span>
              <span className="text-xs text-[#94a3b8]">{allDone}/{actions.length} · {allHours}h</span>
            </div>
            <ProgressBar value={allPct} color="#94a3b8" />
          </div>
        </div>

        {/* 2-col layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* LEFT column */}
          <div className="space-y-6">
            {/* Ultimate Result */}
            <div className="bg-[#111827] rounded-xl border border-[#1f2d45] p-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-3">
                Ultimate Result
              </p>
              <InlineEdit
                value={project.ultimate_result}
                onSave={(v) => updateProject('ultimate_result', v)}
                placeholder="Click to add the specific, measurable outcome…"
                multiline
                className="text-white text-sm leading-relaxed"
              />
            </div>

            {/* Key Results */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold tracking-widest uppercase text-[#475569]">Key Results</p>
                <button onClick={() => setAddingKR(true)}
                  className="w-7 h-7 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              <div className="space-y-2">
                {keyResults.map((kr, i) => (
                  <div key={kr.id} className="flex items-center gap-2 bg-[#111827] rounded-lg border border-[#1f2d45] px-3 py-2 group">
                    <span className="text-xs text-[#475569] w-5 flex-shrink-0">{i + 1}</span>
                    <button onClick={() => toggleKR(kr)}
                      className="w-4 h-4 rounded border border-[#1f2d45] flex-shrink-0 flex items-center justify-center hover:border-[#f97316]"
                      style={{ backgroundColor: kr.is_complete ? accentColor : 'transparent' }}>
                      {kr.is_complete && <Check size={9} className="text-white" strokeWidth={3} />}
                    </button>
                    <span className={`flex-1 text-sm ${kr.is_complete ? 'line-through text-[#475569]' : 'text-white'}`}>
                      {kr.title}
                    </span>
                    {kr.due_date && (
                      <span className="text-xs text-[#475569] flex items-center gap-1">
                        <Calendar size={11} />{format(new Date(kr.due_date), 'MMM d')}
                      </span>
                    )}
                    <button onClick={() => toggleKRStar(kr)}
                      className={`flex-shrink-0 ${kr.is_starred ? 'text-yellow-400' : 'text-[#475569] opacity-0 group-hover:opacity-100'}`}>
                      <Star size={12} fill={kr.is_starred ? 'currentColor' : 'none'} />
                    </button>
                    <button onClick={() => deleteKR(kr.id)}
                      className="opacity-0 group-hover:opacity-100 text-[#475569] hover:text-[#ef4444] transition-all">
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
                {addingKR && (
                  <div className="flex gap-2">
                    <Input value={newKRTitle} onChange={(e) => setNewKRTitle(e.target.value)}
                      onKeyDown={(e) => { if (e.key === 'Enter') addKeyResult(); if (e.key === 'Escape') { setAddingKR(false); setNewKRTitle('') } }}
                      placeholder="Key result title…" autoFocus
                      className="bg-[#1a2235] border-[#1f2d45] text-white placeholder:text-[#475569] text-sm" />
                    <Button onClick={addKeyResult} className="bg-[#f97316] hover:bg-[#ea6c0a] text-white h-9">Add</Button>
                    <Button variant="ghost" onClick={() => { setAddingKR(false); setNewKRTitle('') }}
                      className="text-[#94a3b8] h-9">✕</Button>
                  </div>
                )}
                {keyResults.length === 0 && !addingKR && (
                  <p className="text-[#475569] text-sm italic px-1">No key results yet</p>
                )}
              </div>
            </div>

            {/* Capture List */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold tracking-widest uppercase text-[#475569]">Capture List</p>
                <button onClick={() => { setEditingAction(undefined); setActionFormOpen(true) }}
                  className="w-7 h-7 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              {captureList.length === 0 ? (
                <p className="text-[#475569] text-sm italic px-1">No unassigned actions</p>
              ) : (
                <div className="space-y-0.5">
                  {captureList.map((action) => (
                    <ActionItem key={action.id} action={action} accentColor={accentColor}
                      onUpdate={(a) => setActions((prev) => prev.map((x) => x.id === a.id ? a : x))}
                      onDelete={(id) => setActions((prev) => prev.filter((x) => x.id !== id))}
                      onEdit={(a) => { setEditingAction(a); setActionFormOpen(true) }} />
                  ))}
                </div>
              )}
              {captureCompleted.length > 0 && (
                <p className="text-xs text-[#475569] mt-2">{captureCompleted.length} completed actions</p>
              )}
            </div>
          </div>

          {/* RIGHT column */}
          <div className="space-y-6">
            {/* Ultimate Purpose */}
            <div className="bg-[#111827] rounded-xl border border-[#1f2d45] p-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-3">
                Ultimate Purpose
              </p>
              <InlineEdit
                value={project.ultimate_purpose}
                onSave={(v) => updateProject('ultimate_purpose', v)}
                placeholder="Click to add the deeper emotional why…"
                multiline
                className="text-[#94a3b8] text-sm leading-relaxed"
              />
            </div>

            {/* Inspiration Board placeholder */}
            <div className="bg-[#111827] rounded-xl border border-[#1f2d45] p-5">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#475569] mb-3">
                Inspiration Board
              </p>
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <ImagePlus size={28} className="text-[#475569] mb-2" />
                <p className="text-[#475569] text-sm">Add inspiring images — coming in Phase 9</p>
              </div>
            </div>

            {/* RPM Blocks */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold tracking-widest uppercase text-[#475569]">RPM Blocks</p>
                <button onClick={() => { setEditingBlock(undefined); setBlockFormOpen(true) }}
                  className="w-7 h-7 rounded-lg bg-[#1a2235] hover:bg-[#f97316] text-[#94a3b8] hover:text-white flex items-center justify-center transition-colors">
                  <Plus size={14} />
                </button>
              </div>
              {blocks.length === 0 ? (
                <p className="text-[#475569] text-sm italic px-1">No blocks yet</p>
              ) : (
                <div className="space-y-3">
                  {blocks.map((block) => (
                    <BlockCard key={block.id} block={block} accentColor={accentColor}
                      onUpdate={(b) => setBlocks((prev) => prev.map((x) => x.id === b.id ? b : x))}
                      onDelete={(id) => setBlocks((prev) => prev.filter((x) => x.id !== id))}
                      onEdit={(b) => { setEditingBlock(b); setBlockFormOpen(true) }} />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <ActionForm
        open={actionFormOpen}
        onClose={() => { setActionFormOpen(false); setEditingAction(undefined) }}
        onSave={(action) => {
          setActions((prev) => {
            const idx = prev.findIndex((a) => a.id === action.id)
            if (idx >= 0) { const next = [...prev]; next[idx] = action; return next }
            return [...prev, action]
          })
        }}
        initial={editingAction}
        defaultProjectId={project.id}
        defaultCategoryId={project.category_id ?? undefined}
      />
      <BlockForm
        open={blockFormOpen}
        onClose={() => { setBlockFormOpen(false); setEditingBlock(undefined) }}
        onSave={(block) => {
          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.id === block.id)
            if (idx >= 0) { const next = [...prev]; next[idx] = block; return next }
            return [...prev, block]
          })
        }}
        initial={editingBlock}
        defaultProjectId={project.id}
        defaultCategoryId={project.category_id ?? undefined}
      />
    </div>
  )
}
